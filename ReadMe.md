# React DOM Lite

_"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.” - Antoine de Saint-Exupery._

Compliance and amazing cross browser support led to a robust but heavy `react-dom`. React DOM Lite is an attempt to sculpt away some of the mass away and see if we can make something more low powered device friendly.

## Road map

Keeping in mind the existing React ecosystem (and of course the web ecosystem too), following is the feature list to attain feature parity with the existing react-dom:

* SVG and namespaced attribute support
* Event normalization / polyfilling
* Portals (event propagation)
* Controlled inputs
* Browser support matrix
* SSR, hydration.

The goal is to be compatible with the react ecosystem, while remaining lite. This will likely mean that the supported browsers, will be more limited than react-dom, and attempts to polyfill differences between browsers will be limited and more tightly scoped.
