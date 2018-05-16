// @flow

type Fiber = any;
type FiberRoot = any;

type Deadline = {
  timeRemaining: () => number,
};

export type ReactNode =
  | React$Element<any>
  | ReactCall<any>
  | ReactReturn<any>
  | ReactPortal
  | ReactText
  | ReactFragment;

type ReactFragment = ReactEmpty | Iterable<React$Node>;

type ReactNodeList = ReactEmpty | React$Node;

type ReactText = string | number;

type ReactEmpty = null | void | boolean;

type ReactCall<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null | string,
  ref: null,
  props: {
    props: any,
    // This should be a more specific CallHandler
    handler: (props: any, returns: Array<V>) => ReactNodeList,
    children?: ReactNodeList,
  },
};

type ReactReturn<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null,
  ref: null,
  props: {
    value: V,
  },
};

type ReactPortal = {
  $$typeof: Symbol | number,
  key: null | string,
  containerInfo: any,
  children: ReactNodeList,
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
};

declare module 'react-reconciler' {
  declare export type OpaqueHandle = Fiber;
  declare export type OpaqueRoot = FiberRoot;
  declare export type ExpirationTime = number;

  declare export type HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL> = {
    getRootHostContext(rootContainerInstance: C): CX,
    getChildHostContext(parentHostContext: CX, type: T, instance: C): CX,
    getPublicInstance(instance: I | TI): PI,

    createInstance(
      type: T,
      props: P,
      rootContainerInstance: C,
      hostContext: CX,
      internalInstanceHandle: OpaqueHandle,
    ): I,
    appendInitialChild(parentInstance: I, child: I | TI): void,
    finalizeInitialChildren(
      parentInstance: I,
      type: T,
      props: P,
      rootContainerInstance: C,
      hostContext: CX,
    ): boolean,

    prepareUpdate(
      instance: I,
      type: T,
      oldProps: P,
      newProps: P,
      rootContainerInstance: C,
      hostContext: CX,
    ): null | PL,

    shouldSetTextContent(type: T, props: P): boolean,
    shouldDeprioritizeSubtree(type: T, props: P): boolean,

    createTextInstance(
      text: string,
      rootContainerInstance: C,
      hostContext: CX,
      internalInstanceHandle: OpaqueHandle,
    ): TI,

    scheduleDeferredCallback(
      callback: (deadline: Deadline) => void,
      options?: { timeout: number },
    ): number,
    cancelDeferredCallback(callbackID: number): void,

    prepareForCommit(): void,
    resetAfterCommit(): void,

    now(): number,

    useSyncScheduling?: boolean,

    +hydration?: HydrationHostConfig<T, P, I, TI, HI, C, CX, PL>,

    +mutation?: MutableUpdatesHostConfig<T, P, I, TI, C, PL>,
    +persistence?: PersistentUpdatesHostConfig<T, P, I, TI, C, CC, PL>,
  };

  declare type MutableUpdatesHostConfig<T, P, I, TI, C, PL> = {
    commitUpdate(
      instance: I,
      updatePayload: PL,
      type: T,
      oldProps: P,
      newProps: P,
      internalInstanceHandle: OpaqueHandle,
    ): void,
    commitMount(
      instance: I,
      type: T,
      newProps: P,
      internalInstanceHandle: OpaqueHandle,
    ): void,
    commitTextUpdate(textInstance: TI, oldText: string, newText: string): void,
    resetTextContent(instance: I): void,
    appendChild(parentInstance: I, child: I | TI): void,
    appendChildToContainer(container: C, child: I | TI): void,
    insertBefore(parentInstance: I, child: I | TI, beforeChild: I | TI): void,
    insertInContainerBefore(
      container: C,
      child: I | TI,
      beforeChild: I | TI,
    ): void,
    removeChild(parentInstance: I, child: I | TI): void,
    removeChildFromContainer(container: C, child: I | TI): void,
  };

  declare type PersistentUpdatesHostConfig<T, P, I, TI, C, CC, PL> = {
    cloneInstance(
      instance: I,
      updatePayload: null | PL,
      type: T,
      oldProps: P,
      newProps: P,
      internalInstanceHandle: OpaqueHandle,
      keepChildren: boolean,
      recyclableInstance: I,
    ): I,

    createContainerChildSet(container: C): CC,

    appendChildToContainerChildSet(childSet: CC, child: I | TI): void,
    finalizeContainerChildren(container: C, newChildren: CC): void,

    replaceContainerChildren(container: C, newChildren: CC): void,
  };

  declare type HydrationHostConfig<T, P, I, TI, HI, C, CX, PL> = {
    // Optional hydration
    canHydrateInstance(instance: HI, type: T, props: P): null | I,
    canHydrateTextInstance(instance: HI, text: string): null | TI,
    getNextHydratableSibling(instance: I | TI | HI): null | HI,
    getFirstHydratableChild(parentInstance: I | C): null | HI,
    hydrateInstance(
      instance: I,
      type: T,
      props: P,
      rootContainerInstance: C,
      hostContext: CX,
      internalInstanceHandle: OpaqueHandle,
    ): null | PL,
    hydrateTextInstance(
      textInstance: TI,
      text: string,
      internalInstanceHandle: OpaqueHandle,
    ): boolean,
    didNotMatchHydratedContainerTextInstance(
      parentContainer: C,
      textInstance: TI,
      text: string,
    ): void,
    didNotMatchHydratedTextInstance(
      parentType: T,
      parentProps: P,
      parentInstance: I,
      textInstance: TI,
      text: string,
    ): void,
    didNotHydrateContainerInstance(parentContainer: C, instance: I | TI): void,
    didNotHydrateInstance(
      parentType: T,
      parentProps: P,
      parentInstance: I,
      instance: I | TI,
    ): void,
    didNotFindHydratableContainerInstance(
      parentContainer: C,
      type: T,
      props: P,
    ): void,
    didNotFindHydratableContainerTextInstance(
      parentContainer: C,
      text: string,
    ): void,
    didNotFindHydratableInstance(
      parentType: T,
      parentProps: P,
      parentInstance: I,
      type: T,
      props: P,
    ): void,
    didNotFindHydratableTextInstance(
      parentType: T,
      parentProps: P,
      parentInstance: I,
      text: string,
    ): void,
  };

  // 0 is PROD, 1 is DEV.
  // Might add PROFILE later.
  declare type BundleType = 0 | 1;

  declare type DevToolsConfig<I, TI> = {|
    bundleType: BundleType,
    version: string,
    rendererPackageName: string,
    // Note: this actually *does* depend on Fiber internal fields.
    // Used by "inspect clicked DOM element" in React DevTools.
    findFiberByHostInstance?: (instance: I | TI) => Fiber,
    // Used by RN in-app inspector.
    // This API is unfortunately RN-specific.
    // TODO: Change it to accept Fiber instead and type it properly.
    getInspectorDataForViewTag?: (tag: number) => Object,
  |};

  declare export type Reconciler<C, I, TI> = {
    createContainer(
      containerInfo: C,
      isAsync: boolean,
      hydrate: boolean,
    ): OpaqueRoot,
    updateContainer(
      element: ReactNodeList,
      container: OpaqueRoot,
      parentComponent: ?React$Component<any, any>,
      callback: ?Function,
    ): ExpirationTime,
    updateContainerAtExpirationTime(
      element: ReactNodeList,
      container: OpaqueRoot,
      parentComponent: ?React$Component<any, any>,
      expirationTime: ExpirationTime,
      callback: ?Function,
    ): ExpirationTime,
    flushRoot(root: OpaqueRoot, expirationTime: ExpirationTime): void,
    requestWork(root: OpaqueRoot, expirationTime: ExpirationTime): void,
    batchedUpdates<A>(fn: () => A): A,
    unbatchedUpdates<A>(fn: () => A): A,
    flushSync<A>(fn: () => A): A,
    deferredUpdates<A>(fn: () => A): A,
    injectIntoDevTools(devToolsConfig: DevToolsConfig<I, TI>): boolean,
    computeUniqueAsyncExpiration(): ExpirationTime,

    // Used to extract the return value from the initial render. Legacy API.
    getPublicRootInstance(
      container: OpaqueRoot,
    ): React$Component<any, any> | TI | I | null,

    // Use for findDOMNode/findHostNode. Legacy API.
    findHostInstance(component: Fiber): I | TI | null,

    // Used internally for filtering out portals. Legacy API.
    findHostInstanceWithNoPortals(component: Fiber): I | TI | null,
  };

  declare export default function createReconciler<
    T,
    P,
    I,
    TI,
    HI,
    PI,
    C,
    CC,
    CX,
    PL,
  >(
    config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
  ): Reconciler<C, I, TI>;
}
