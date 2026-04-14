# inject-in-injection-context

Prevent to use `inject()` outside an injection context, to avoid the `NG0203` runtime error.

## ❌ Invalid

- in lifecycle methods, notably `ngOnInit`
```typescript
@Component()
export class ProductPage implements OnInit {
  readonly id = input.required<number>();

  ngOnInit(): void {
    const productApi = inject(ProductApi);
    productApi.getProduct(this.id()).subscribe();
  }
}
```

- in any methods other than the constructor
```typescript
@Component({
  template: `<form (submit)="save()"></form>`
})
export class ProductEditPage {
  save(): void {
    const productApi = inject(ProductApi);
    productApi.saveProduct(this.id()).subscribe();
  }
}
```

- in callbacks
```typescript
@Component() 
export class ProductPage {
  private readonly dataObservable = inject(ActivatedRoute).paramMap.pipe(
    map((paramMap) => paramMap.get('id') ?? '1'),
    switchMap((id) => inject(ProductsApi).getProduct(id)),
  );
}
```

> [!NOTE]
> The rule reports both on asynchronous and synchronous callbacks, see known limitations below.

- after awaiting (which is equivalent to be in a `.then()` callback)
```typescript
const myGuard: CanActivateFn = async () => {
  await someAsyncFunction();
  const someService = inject(SomeService);
  return someService.isOK;
};
```

- in non-Angular classes
```typescript
export class Product {
  private readonly productApi = inject(ProductApi);
}
```

- in standalone functions
```typescript
function someFunction(): void {
  const someService = inject(SomeService);
} 
```

## ✅ Valid

- in constructors of components, directives, pipes and injectables/services
```typescript
@Component()
export class ProductsPage {
  constructor(): void {
    const productApi = inject(ProductApi);
    productApi.getProducts().subscribe();
  }
}
```

- in property initializers of components, directives, pipes and injectables/services
```typescript
@Component()
export class ProductPage implements OnInit {
  readonly id = input.required<number>();
  private readonly productApi = inject(ProductApi);

  ngOnInit(): void {
    this.productApi.getProduct(this.id()).subscribe();
  }
}
```

- in guards, resolvers and interceptors
```typescript
const authGuard: CanActivateFn = () => {
  const authService = inject(authService)
  return authService.isAuthenticated;
};
```

- in routes options involving a function:
```typescript
export const routes: Routes = [{
  path: 'some/path',
  redirectTo: () => {
    const someService = inject(SomeService);
    return someService.data === 'secret' ? '/secret/path' : '/some/other/path';
  },
}];
```

> [!NOTE]
> Injection context is only available:
> - `loadComponent`: Angular >= 20.1
> - `loadChildren`: Angular >= 20.1
> - `runGuardsAndResolvers`: Angular >= 21.1

- in injection tokens
```typescript
const MY_TOKEN = new InjectionToken('my-token', {
  factory: () => {
    const someService = inject(SomeService);
    return someService.data;
  },
});
```

- in providers and injectables factories
```typescript
const provider: Provider = {
  provide: SOME_TOKEN,
  useFactory: () => {
    const someService = inject(SomeService);
    return someService.data;
  },
};
```

- in some providers during app initialization:
  - `provideAppInitializer()`
  - `providePlatformInitializer()`
  - `provideEnvironmentInitializer()`
  - `withViewTransitions()` `onViewTransitionCreated`

- in explicit injection context
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private readonly environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      const someService = inject(SomeService);
    });
  }
}
```

> [!NOTE]
> The rule only detects `runInInjectionContext()` in the current function, see known limitations below.

- when asserted
```typescript
function customOperator(destroyRef?: DestroyRef) {
  if (!destroyRef) {
    assertInInjectionContext(customOperator);
  }
  destroyRef ??= inject(DestroyRef);
}
```

## Known limitations

This is a lint rule like any other, so it can be disabled when necessary:
```ts
// eslint-disable-next-line angular-eslint-injection-context/no-inject-outside-di-context
inject(MyService);
```

### Synchronous callbacks

The injection context is lost only in _asynchronous_ callbacks. Technically, it should still be available in _synchronous_ callbacks. But it is not possible to differenciate asynchronous and synchronous callbacks during the lint analysis. So the rule will report when using `inject()` in _any_ callback.

While this is a limitation, it is acceptable as it is better to always do `inject()` upstream, before any callback, for several reasons:
- to avoid errors, as some functions can be synchronous or asynchronous depending on complex contexts, hard to understand for beginners, and not apparent at first glance even for experts (notably all RxJS functions)
- to be consistent

### runInInjectionContext() done before in the call stack

This rule detects if `runInInjectionContext()` is called. But it does so only in the current function. If it was done before in another function in the call stack, the injection may still be available, but the lint analysis cannot detect that.

While this is a limitation, it is acceptable because:
- it is a rare and edge case, happening at framework-level or in low-level libraries, but very unlikely in applications
- seems like a bad practice to rely on another function to manage `runInInjectionContext()`
