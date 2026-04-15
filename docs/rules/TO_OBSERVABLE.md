# inject-in-injection-context

Checks that `toObservable()` is called inside an injection context, or that an explicit `Injector` is provided in the second argument,  to avoid the `NG0203` runtime error.

## Documentation

- [`toObservable()` API reference](https://angular.dev/api/core/rxjs-interop/toObservable)
- [RxJS interop guide](https://angular.dev/ecosystem/rxjs-interop#create-an-rxjs-observable-from-a-signal-with-toobservable)
- [General injection context documentation](https://angular.dev/guide/di/dependency-injection-context)

## ❌ Invalid

- in lifecycle methods, notably `ngOnInit`
```typescript
@Component()
export class ProductPage implements OnInit {
  private readonly id = signal(0);

  ngOnInit(): void {
    toObservable(this.id);
  }
}
```

- in any methods other than the constructor
```typescript
@Component({
  template: `<form (submit)="save()"></form>`
})
export class ProductEditPage {
  private readonly id = signal(0);

  save(): void {
    toObservable(this.id);
  }
}
```

- in callbacks
```typescript
@Component() 
export class ProductPage {
  private readonly id = signal(0);
  private readonly dataObservable = someObservable.pipe(
    switchMap(() => toObservable(this.id)),
  );
}
```

> [!NOTE]
> The rule reports both on asynchronous and synchronous callbacks, see known limitations below.

- after awaiting (which is equivalent to be in a `.then()` callback)
```typescript
const id = signal(0);
const myGuard: CanActivateFn = async () => {
  await someAsyncFunction();
  return toObservable(id);
};
```

- in non-Angular classes
```typescript
export class Product {
  private readonly id = signal(0);
  private readonly idObservable = toObservable(this.id);
}
```

- in standalone functions
```typescript
function someFunction(): void {
  const id = signal(0);
  toObservable(id);
} 
```

## ✅ Valid

- in constructors of components, directives, pipes and injectables/services
```typescript
@Component()
export class ProductsPage {
  private readonly id = signal(0);

  constructor(): void {
    toObservable(this.id);
  }
}
```

- in property initializers of components, directives, pipes and injectables/services
```typescript
@Component()
export class ProductPage implements OnInit {
  private readonly id = signal(0);
  private readonly idObservable = toObservable(this.id);
}
```

- in guards, resolvers and interceptors
```typescript
const isAuthenticated = signal(false);
const authGuard: CanActivateFn = () => {
  return toObservable(isAuthenticated);
};
```

- in routes options involving a function:
```typescript
const redirectPath = signal('/some/path');
export const routes: Routes = [{
  path: 'some/path',
  redirectTo: () => toObservable(redirectPath),
}];
```

> [!NOTE]
> Injection context is only available:
> - `loadComponent`: Angular >= 20.1
> - `loadChildren`: Angular >= 20.1
> - `runGuardsAndResolvers`: Angular >= 21.1

- in some providers during app initialization:
  - `provideAppInitializer()`

- in explicit injection context
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private readonly id = signal(0);
  private readonly environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      toObservable(this.id)
    });
  }
}
```

> [!NOTE]
> The rule only detects `runInInjectionContext()` in the current function, see known limitations below.

- when asserted
```typescript
function customOperator(injector: Injector) {
  if (!injector) {
    assertInInjectionContext(customOperator);
  }
  const id = signal(0);
  toObservable(id, injector ? { injector } : undefined);
}
```

## Known limitations

This is a lint rule like any other, so it can be disabled when necessary:
```ts
// eslint-disable-next-line angular-eslint-injection-context/no-inject-outside-di-context
inject(MyService);
```

### Synchronous callbacks (false positive)

The injection context is lost only in _asynchronous_ callbacks. Technically, it should still be available in _synchronous_ callbacks. But it is not possible to differenciate asynchronous and synchronous callbacks during the lint analysis. So the rule will report when using `inject()` in _any_ callback.

While this is a limitation, it is acceptable as it is better to always do `inject()` upstream, before any callback, for several reasons:
- to avoid errors, as some functions can be synchronous or asynchronous depending on complex contexts, hard to understand for beginners, and not apparent at first glance even for experts (notably all RxJS functions)
- to be consistent

### runInInjectionContext() done before in the call stack (false positive)

This rule detects if `runInInjectionContext()` is called. But it does so only in the current function. If it was done before in another function in the call stack, the injection may still be available, but the lint analysis cannot detect that.

While this is a limitation, it is acceptable because:
- it is a rare and edge case, happening at framework-level or in low-level libraries, but very unlikely in applications
- seems like a bad practice to rely on another function to manage `runInInjectionContext()`
