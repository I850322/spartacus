## 1. Title
_Short title of the decision_

Install extensions for existing lazy loaded feature

## 2. Status
_Proposed / Approved / Rejected / Superseded_

Approved

## 3. Involved areas
extensibility, lazy-loading, dependency injection, schematics installation

## 4. Context
_Explain why the decision is being taken_

New opt-in Spartacus features should be able to extend the existing lazy-loadable Spartacus features. We didn't have a need for it yet, but now this changes due to extracting more-and-more code to lazy-loaded modules and decoupling into independent, opt-in, composable “plugin-like” libraries. Also, the usual techniques for extending services don't work in the case of lazy-loaded modules.

The usual technique of providing the extending service in the root injector, e.g. `{provide: ..., useClass:...}` in the `AppModule` (or any other statically imported module) doesn't overwrite the base service in the lazy-loaded module. The lazy-loaded module instantiates its own, fresh child-injector, which derives from the parent (root) injector, but locally has a higher priority than the parent one. And because the base service implementation is provided in the lazy-loaded module that has its own child-injector, the extension service provided in the root injector cannot overwrite the base one.

We need to find a way to automatically install (via schematics) the opt-in libraries, so they extend the existing lazy-loaded features originating from different libraries. We should find an optimal, future-proof solution, because it might be used very often in OOTB Spartacus soon.

Note: For details on instantiating the lazy-loaded modules and setting the parent injector, see the implementation of Spartacus' [LazyModulesService#resolveModuleInstance](https://github.com/SAP/spartacus/blob/a1421cf95481c6f2b59926a91f4e9380ff10f70b/projects/core/src/lazy-loading/lazy-modules.service.ts#L86). 

Note: At the time of writing, our schematics create in the app the dynamic imports pointing directly to the path of Spartacus feature library. See the following example for the checkout feature:

```ts
// CheckoutFeatureModule in the app:
provideConfig({
  featureModules: {
    [CHECKOUT_FEATURE]: {
      module: () =>
        import('@spartacus/checkout/base').then((m) => m.CheckoutModule),
        // point to library's path 👆
    },
  },
}),
```

## 5. Alternatives considered
_List the alternative options you considered with their pros and cons_

### Option 1 (currently used): Pre-baked wrapper modules in the Spartacus extension library
Idea: The module of Spartacus extension library acts as the wrapper module, importing both the base feature module as well as providing custom extensions. See the following example for Digital Payments feature that extends Checkout:
```ts
// DigitalPaymentsModule in @spartacus/digital-payments:

import { CheckoutModule } from '@spartacus/checkout/base';
import { DpCheckoutModule } from './checkout/dp-checkout.module';

@NgModule({
  imports: [
    CheckoutModule,   // import base feature module
    DpCheckoutModule  // provide custom extensions
  ],
})
export class DigitalPaymentsModule {}
```

The schematics installer of the Digital-Payments library adds a new file in the app, providing the config chunk for the same feature key `CHECKOUT_FEATURE`, pointing to the extension library's path (instead of the original feature library's path):

```ts
// DigitalPaymentsFeatureModule in the app:
provideConfig({
  featureModules: {
    [CHECKOUT_FEATURE]: {
      // 👆 name of the base feature
      module: () =>
        import('@spartacus/digital-payments').then((m) => m.DigitalPaymentsModule),
        // point to extension library's module 👆
        // which inside wraps the base feature module
        // CheckoutModule and provides custom extensions
    },
  },
}),
```

The following diagram shows that e.g. digital payments module imports statically the original checkout module. And in the app our dynamic import points to the digital payments module.
![](./pre-baked-digital-payments-module-diagram.png)

Moreover, this approach allows for installing automatically (via schematics) only one extension feature for one base feature. This is a blocker issue. Taking as an example the Checkout feature, customers might want to use many possible opt-in extensions originating from various Spartacus libraries, e.g. `DigitalPaymentsModule`, `B2bCheckoutModule` or `ScheduledReplenishmentCheckoutModule`. The following diagram pictures the dilemma, to which library's the dynamic import should point to:
![](./pre-baked-wrapper-modules-diagram.png)

To combine multiple extensions we would need to export from Spartacus libraries **every possible combination of features** (e.g.`CheckoutB2bScheduledReplenishmentDigitalPaymentsModule` for checkout with: b2b, repl and digital payments). It's not acceptable, as it's:
- hard to maintain
- add great complexity to the schematics installer
- it's not clear which library should export a cross-feature combination module
- increase the bundle size, since we would be shipping extra pre-baked module which might never be used


Note: at the time of writing, this solution is used in the `develop` branch. See `DigitalPaymentsModule` as an example: https://github.com/SAP/spartacus/blob/780cd570ca56b2f55a94872b4c0f7ae30b5fdccd/integration-libs/digital-payments/src/digital-payments.module.ts#L5-L8

#### Pros:
- You can install an extension for an existing lazy loaded feature

#### Cons:
- You cannot install many extensions for one one base feature

### Option 2: Local wrapper module in the app
Idea: Introduce a local wrapper module in the app and import it dynamically instead of the base Spartacus module:
```ts
// CheckoutFeatureModule in the app:
provideConfig({
  featureModules: {
    [CHECKOUT_FEATURE]: {
      // 👆 name of the base feature
      module: () =>
        import('./checkout-wrapper.module').then((m) => m.CheckoutWrapperModule),
        // point to a local file in the app 👆
    },
  },
}),
```

Then inside the local wrapper module we primarily import (statically) the base Spartacus module, but also allow for importing (statically) many other extensions modules. 

The child-injector belongs to the local wrapper module (as it's lazy-loaded). All the modules imported inside share the same child-injector. Therefore the extension service has a chance to overwrite the base service. The following example shows the content of the local `CheckoutWrapperModule` in the app:

```ts
// CheckoutWrapperModule in the app:

import { CheckoutModule } from '@spartacus/checkout/base';
import { DigitalPaymentsModule } from '@spartacus/digital-payments';

@NgModule({
  imports: [ 
    // base module providing base service:
    CheckoutModule, 
    
    // extension module with providers overwriting the base service:
    DigitalPaymentsModule 
  ]
})
export class CheckoutWrapperModule {}
```

As a result, all the "wrapped" features are being bundled in one JS chunk and lazy-loaded in one go.

The working example can be found in the PoC PR: https://github.com/SAP/spartacus/pull/14871

The following diagram shows possibility of composing many extensions for the checkout feature:
![](./wrapper-module-in-the-app.png)


Assuming, that the lazy-loadable feature has its own wrapper module in the app, the installation of the extension features means appending the extension module inside the wrapper module.

The installer should basically locate the import of the base feature module in the customer's codebase (e.g. import of `CheckoutModule`), and append the extension module (e.g. `DigitalPayments`) after it. The following example shows the content of the wrapper module, including the base `CheckoutModule` (being a marker for the schematics installer) and the extensions modules `B2bCheckoutModule` and `DigitalPaymentsModule` imported after the marker:

```ts
// CheckoutWrapperModule in the app:
@NgModule({
  imports: [
    CheckoutModule,       // marker where to append extension modules
    B2bCheckoutModule,    // <-- appended by schematics
    DigitalPaymentsModule // <-- appended by schematics
  ],
})
export class CheckoutWrapperModule {}
```


Note: the order of installing libraries is important. The base feature must be installed first (so the base module is added in the codebase), and later the extensions must be installed (because their installer will look for the marker base module).

Note: It's debatable how to name the wrapper modules. By voting in the Blamed Team, we've chosen `XxxWrapperModule`. For reference, here are alternatives that were considered, based on the example of `CheckoutModule`:
- `CheckoutWrapperModule` ✅ 
- `CheckoutExtensionModule`
- `CheckoutExtendedModule`
- `CheckoutCustomModule`
- `CheckoutCustomizedModule`
- `CheckoutLocalModule`



#### Pros
- You can install many extensions for one one base feature
- by the way, when the base module is imported inside a wrapper module, it improves tree-shaking - any public API members exported from the library's path (e.g. `@spartacus/checkout/base`) that are not used in the app will be tree-shaken

#### Cons
- adds complexity to current installation schematics
  - create wrapper modules
  - append extension modules after marker modules
  - sort the installation of features and extensions (requires custom analysis of dependency tree)
- the local wrapper module in customer's app knows about all extensions for the base feature (because their modules are all imported inside this one file)  
- we add more modules in customer's app
- negligible(!) increase in the production built JS bundle of the lazy-loaded feature: 100-200 bytes (depending on the length of the class name).
  - Note that the OOTB `UserProfileModule` feature has 42.15 kB at the moment of writing. So the increase in this case is 0.3% and it affects only the lazy-loaded chunk, but not the main JS chunk. 


#### Consequences

- [x] does it increase the production main JS bundle size?
  - NO
- [x] does it cause producing more JS chunks than before?
  - NO
- [x] will it break lazy loading when we statically import the base module inside the wrapper module?
  - NO
- [x] should we adapt our _installation schematics_ to create wrapper modules OOTB? 
  - YES
- [x] should we create wrapper modules for all features or only those that are extended by other opt-in features?
  - ONLY THE EXTENDED ONES, not to introduce unnecessary boilerplate in the app
- [x] should we automate for customers creation of the wrapper modules out from the old dynamic imports pointing to Spartacus library's path (e.g. `()=>import('@spartacus/store-finder')`))?
  - YES, the local wrapper should be created on the fly by the installer of the extension module
- [x] how should the installer behave, when there is no marker module in the app (e.g. because customer dismantled it into smaller modules)
  - WARN in the console and explain how to import the module manually
- [x] how should the installer behave, when customer is not using lazy loading (i.e. when the marker module is imported only statically)
  - NOTHING DIFFERENT, just append the extension module after the base module
- [x] should we update our installer, so it first installs the base feature and only later the extensions?
  - YES, we need to add a logic that analyzes the dependencies between feature and extension modules and then installs all features in the correct order
  
#### Plan of implementation

1. implement schematics util that breaks down the given dynamic import into a wrapper module, e.g:
    
    `ng g @spartacus/schematics:wrapper --module=CheckoutModule --module-path=@spartacus/checkout/base`

1. implement schematics util that appends the given extension module after another "marker" module, e.g:   
    
    `ng g @spartacus/schematics:append-module --module=DigitalPaymentsModule --module-path=@spartacus/digital-payments --after-module=CheckoutModule --after-module-path=@spartacus/checkout/base`

1. change the implementation of the installation-schematics of our extension features (e.g. DigitalPayments, CheckoutB2b) use the two util schematics above. For example: to install the Digital Payments feature (`ng add @spartacus/digital-payments`): first make sure to break down the dynamic import of `CheckoutModule` into a local wrapper module and only then append the `DigitalPaymentModule` after the `CheckoutModule`.

1. implement the ordered invocation of specific libraries' installation-schematics (including the deep analysis of the cross-dependencies between features)

1. changes needed in current installation-schematics of DigitalPayments and CheckoutB2B (and CdcLogin which is under development):
    - currently CheckoutB2b schematics removes the original checkout file and re-creates it, using key different path in the dynamic import
    - currently DigitalPayments (and similarly Cdc, which is under development) creates a separate module file with the same key `CHECKOUT_FEATURE`, but different dynamic import path. It's problematic as there is no single file where we could break down the dynamic import

### Option 3: Introduce a config `plugins` for lazy-loaded feature modules; implementation: use static empty NgModule + parent CombinedInjector
We want to allow for plugging many extensions for a single module. And ideally we would like to keep installation schematics simple, as well as avoid mutating the local module in customer's app, when plugging the extensions. In other words, we a want loose coupling between the original feature module and the extension modules in the app. 

Idea: we introduce a config `plugins` for lazy-loaded feature modules. The plugins can be provided in separate modules for the same feature name:

See example structure in the customer's app - separate files:
```bash
|- checkout-feature.module.ts           # base feature
|- digital-payments-feature.module.ts   # extension feature
```

```ts
// checkout-feature.module.ts - unchanged, created by schematics as of today
provideConfig(<CmsConfig>{
  featureModules: {
    [CHECKOUT_FEATURE]: {
      // 👆 feature name
      module: () =>
        import('@spartacus/checkout/base').then((m) => m.CheckoutModule),
        // point to base library's path 👆
    },
  },
}),
```

```ts
// digital-payments-feature.module.ts
provideConfig(<CmsConfig>{
  featureModules: {
    [CHECKOUT_FEATURE]: {
      // 👆 the same feature name
      
      // PROPOSAL OF THE NEW CONFIG PROPERTY:
      plugins: [
        () =>
          import('@spartacus/digital-payments').then((m) => m.DigitalPaymentsModule),
          // point to extension library's path 👆
      ]
    },
  },
}),
```

#### Implementation details
We collect config for `module` and `plugins`. Under the hood we instantiate artificially an empty `NgModule` as the base module. And when instantiating it, we set its parent injector to the `CombinedInjector` consisting of (in the following order): the plugins' injectors and the original base feature module's injector.
This should allow for injecting services first from plugins modules, then from original feature module, and later from dependencies modules.
(For more see the implementation of the [CombinedInjector](https://github.com/SAP/spartacus/blob/018ec3d93ecb506ce9c1bc0ef1aa99aa8c5901d4/projects/core/src/util/combined-injector.ts#L11-L20).)

#### Pros
- extensions modules (plugins) can live in separate files in customer's app. The base feature module remains untouched.
- it doesn't require importing both the original and plugin modules in the same file (in the wrapper module).
#### Cons
- it doesn't work properly for multi-provided tokens (including `MODULE_INITIALIZER`s), because of the limitation of `CombinedInjector`
  - in details: `CombinedInjector` returns the array of multi-provided tokens only from the first complementary injector that provides the tokens. In other words, `CombinedInjector` cannot return an array combining all multi-provided tokens from all complementary injectors. 
- adds a bit of more non-trivial logic ("magic") to the Spartacus lazy loading and dependency injection

The limitation for multi-provided tokens is not acceptable. For example the `MODULE_INITIALIZER`s (which are multi-provided) would not work properly.
### Option 4: Introduce a config `plugins` for lazy-loaded feature modules; implementation: create wrapper module in runtime using JIT compiler (tweaked Option 3)
Idea: We could tweak the Option 3, and create the wrapper module importing the original module all the plugin modules in the runtime. This helps to avoid using the opinionated and limited `CombinedInjector`.

Note: Here's the working PoC PR: https://github.com/SAP/spartacus/pull/14954
#### Pros
- extensions modules (plugins) can live in separate files in customer's app. The base feature module remains untouched.
- it doesn't require importing both the original and plugin modules in the same file (in the wrapper module).

#### Cons
- increased bundle size (because of bundling JIT compiler) and increased runtime (due to compilation of wrapper modules happening in the browser). See https://angular.io/guide/aot-compiler
- There is some risk that JIT compiler will be removed from Angular in the future. See RFC https://github.com/angular/angular/issues/43133#issuecomment-941151334.
- using JIT compiler introduces some security concerns (see https://angular.io/guide/security#use-the-aot-template-compiler)
  - However they apply mostly to compiling components, but we would only compile the wrapper module, so we should be safe.

This solution is not acceptable, because of introducing increased bundle size and increased runtime.

## 5. Decision
_Elaborate the decision_

Decision is Option 2: Introduce local wrapper modules in the app.

## 6. Consequences
_What becomes easier or more difficult to do because of this change?_

TODO

### Order of installing libraries separately becomes important
When installing libraries separately via bash installation script, the order of installing libraries becomes important, e.g.:
```bash
ng add --skip-confirmation @spartacus/checkout --interactive false
ng add --skip-confirmation @spartacus/digital-payments --interactive false
# note the extension should go after the default feature 👆
```

Instead of installing libraries separately, it's recommended to run `ng add @spartacus/schematics --features=...` (which automatically takes care about the order of installing libraries):
```bash
ng add --skip-confirmation @spartacus/schematics --interactive false \
  --features=Digital-Payments \
  --features=Checkout
# order of `--features` is NOT important above 👆
```