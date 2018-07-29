'use strict';

const fs = require('fs');
const traverse = require('babel-traverse');
const generate = require('babel-generator');
const t = require('babel-types');
const maxmin = require('maxmin');

const { SourceMapConsumer } = require('source-map');

const {
  parse,
  readSource,
  resolveFileName,
  bundle,
  getDir,
  write,
  join,
  searchCode,
} = require('./utils');

let hostConfigDeclarations = [];

function inlineHostConfigDeclarations(bundle, srcReconcilerJS, sourceMapJSON) {
  const ast = parse(bundle);

  const consumerPromise = new SourceMapConsumer(sourceMapJSON);
  const MAIN_FILE_CONTENTS = bundle;
  const REACT_RECONCILER_CALL_CODE =
    'Reconciler(__DEV__ ? HostConfigDev : HostConfigProd)';

  // get position in source
  const RECONCILER_JS_SOURCE = srcReconcilerJS;

  const { line, code, pos } = searchCode(
    RECONCILER_JS_SOURCE,
    REACT_RECONCILER_CALL_CODE,
  );

  // const hostConfigObjectExpression = getHostConfigObjectExpression()
  return (consumer => {
    const {
      line: targetLine,
      column: targetColumn,
    } = consumer.generatedPositionFor({
      source: '../src/Reconciler.js',
      line: line + 1,
      column: pos,
    });
    const targetSource = MAIN_FILE_CONTENTS.split('\n')[targetLine - 1].slice(
      targetColumn,
    );
    // Basically `reactReconciler(HostConfigDev$1);` in the bundled file
    // But we never know what rollup renames the variables to. Thats why
    // the sourcemap lookup

    // Get reconciler callee name and host config object identifier
    const reconcilerCallAST = parse(targetSource);
    let calleeName, hostConfigIdentifier;

    traverse.default(reconcilerCallAST, {
      CallExpression(path) {
        const { callee, arguments: args } = path.node;
        calleeName = callee.name;
        hostConfigIdentifier = args[0].name;
      },
    });

    // I should probably avoid multiple traversals. But for now I'm going to do it anyway

    traverse.default(ast, {
      CallExpression(path) {
        const { callee, arguments: args } = path.node;
        if (callee.name === calleeName) {
          path.node.arguments = [t.objectExpression([])];
        }
      },
    });

    let hostConfigProps;
    let hostConfigKeyValMap = new Map();
    let hostConfigValDefinitionMap = new Map();
    traverse.default(ast, {
      VariableDeclaration(path) {
        const { node: { declarations } } = path;
        const sansHostConfigDeclarations = declarations.filter(declarator => {
          if (declarator.id.name === hostConfigIdentifier) {
            hostConfigProps = declarator.init.arguments[0].properties.map(p => {
              hostConfigKeyValMap.set(p.key.name, p.value.name);
              hostConfigValDefinitionMap.set(p.value.name, null);
              return p.value.name;
            });
            return false;
          } else {
            return true;
          }
        });

        if (sansHostConfigDeclarations.length) {
          path.node.declarations = sansHostConfigDeclarations;
        } else {
          path.remove();
        }
      },
    });

    // Search for all declarations for all of hostConfigProps
    let hostConfigDeclarations = [];
    traverse.default(ast, {
      VariableDeclaration(path) {
        const { node: { declarations } } = path;
        const sansHostConfigDeclarations = declarations.filter(declarator => {
          // Only global host config props

          if (
            !declarator.init ||
            declarator.init.type !== 'MemberExpression' ||
            !declarator.init.object ||
            declarator.init.object.name !== '$$$hostConfig'
          ) {
            if (hostConfigProps.indexOf(declarator.id.name) !== -1) {
              hostConfigDeclarations.push(declarator);
              hostConfigValDefinitionMap.set(declarator.id.name, declarator);
              return false;
            }
          }

          return true;
        });

        if (sansHostConfigDeclarations.length) {
          path.node.declarations = sansHostConfigDeclarations;
        } else {
          path.remove();
        }
      },
      FunctionDeclaration(path) {
        const { node } = path;
        if (hostConfigProps.indexOf(node.id.name) !== -1) {
          hostConfigDeclarations.push(node);
          hostConfigValDefinitionMap.set(node.id.name, node);
          path.remove();
        }
      },
    });

    const hostConfigDeclarationsMap = hostConfigDeclarations.reduce(
      (acc, d) => {
        acc.set(d.id.name, d);
        return acc;
      },
      new Map(),
    );

    // Inline the declarations in reconciler($$$hostConfig)
    traverse.default(ast, {
      FunctionExpression(path) {
        const { node } = path;
        if (node.id && node.id.name === '$$$reconciler') {
          // console.log(path.node.params[0].name);
          // hostConfigDeclarations
          //   .filter(d => d.type === 'FunctionDeclaration').forEach(d => {
          //     path.get('body').unshiftContainer(
          //       'body',
          //       d
          //     );
          //   })
          path.traverse({
            VariableDeclaration(vPath) {
              const { node: { declarations } } = vPath;

              // let nonHostConfigDeclarators = declarations.filter(
              //   declarator =>
              //     !declarator.init ||
              //     declarator.init.type !== 'MemberExpression' ||
              //     !declarator.init.object ||
              //     declarator.init.object.name !== '$$$hostConfig' ||
              //     hostConfigProps.indexOf(declarator.init.property.name) === -1,
              // );

              // if (declarations.length !== nonHostConfigDeclarators.length) {
              //   vPath.node.declarations = nonHostConfigDeclarators.concat(
              //     hostConfigDeclarations
              //       .filter(d => d.type === 'VariableDeclarator')
              //   );
              // }

              let rollupName;
              const hostConfigResolvedDecs = declarations.map(declarator => {
                if (
                  declarator.init &&
                  declarator.init.type === 'MemberExpression' &&
                  declarator.init.object &&
                  declarator.init.object.name === '$$$hostConfig' &&
                  !!(rollupName = hostConfigKeyValMap.get(
                    declarator.init.property.name,
                  ))
                ) {
                  const fn = hostConfigValDefinitionMap.get(rollupName);

                  const {
                    type,
                    id,
                    params,
                    body,
                    generator,
                    async: isAsync,
                  } = fn;
                  if (type === 'FunctionDeclaration') {
                    declarator.init = t.functionExpression(
                      id,
                      params || [],
                      body,
                      generator,
                      isAsync,
                    );
                  } else if (type === 'VariableDeclarator') {
                    declarator.init = fn.init;
                  } else {
                    throw new Error('Shouldnt be here');
                  }
                }

                return declarator;
              });

              vPath.node.declarations = hostConfigResolvedDecs;
            },
          });
        }
      },
    });

    return generate.default(ast).code;
  })(consumerPromise);
}

let srcReconcilerJS = null;
module.exports.hackyGCC = function(options) {
  return {
    transform(code, id) {
      if (id.indexOf('src/Reconciler.js') !== -1) {
        // `code` at this point is transpiled. We need the original source
        srcReconcilerJS = readSource(id);
      }
    },
    ongenerate(options, { code, map }) {
      const fileName = options.file.replace('.temp.js', '.min.js');
      gcc(
        options.file,
        inlineHostConfigDeclarations(code, srcReconcilerJS, map),
      )
        .then(compiledCode => {
          fs.writeFileSync(fileName, compiledCode);
          const size = maxmin(compiledCode, compiledCode, true);
          console.log(
            `Created bundle ${fileName}: ${size.substr(
              size.indexOf(' ? ') + 3,
            )}`,
          );
        })
        .catch(e => {
          console.error('Failed to bundle');
        });
    },
  };
};

function gcc(fileName, source) {
  const ClosureCompiler = require('google-closure-compiler').jsCompiler;

  return new Promise((resolve, reject) => {
    const closureCompiler = new ClosureCompiler({
      // debug: true,
      assumeFunctionWrapper: true,
      compilationLevel: 'SIMPLE',
      languageIn: 'ECMASCRIPT5_STRICT',
      languageOut: 'ECMASCRIPT5_STRICT',
      env: 'CUSTOM',
      rewritePolyfills: false,
      applyInputSourceMaps: false,
    });

    const compilerProcess = closureCompiler.run(
      [
        {
          path: fileName,
          src: source,
        },
      ],
      (exitCode, stdOut, stdErr) => {
        //compilation complete
        resolve(stdOut[0].src);
      },
    );
  });
}

// gcc(
//   'lib/react-dom-lite.js',
//   inlineHostConfigDeclarations(
//     readSource('./lib/react-dom-lite.js'),
//     readSource('./src/Reconciler.js'),
//     JSON.parse(readSource('./lib/react-dom-lite.js.map'))
//   ),
// ).then(compiledCode => {
//   const fileName = 'lib/react-dom-lite.min.js';
//   fs.writeFileSync(fileName, compiledCode);
//   const size = maxmin(compiledCode, compiledCode, true);
//   console.log(
//     `Created bundle ${fileName}: ${size.substr(size.indexOf(' ? ') + 3)}`,
//   );
// }).catch(e => {
//   console.error('Failed to bundle', e);
// });

// console.log(
//   inlineHostConfigDeclarations(
//     readSource('../lib/react-dom-lite.temp.js'),
//     readSource('../src/Reconciler.js'),
//     JSON.parse(readSource('../lib/react-dom-lite.temp.js.map'))
//   )
// )
