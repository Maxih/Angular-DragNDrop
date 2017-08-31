# SF Drag and Drop

An Experiment in dynamically creating and manipulating Components dynamically in Angular 4.

## Overview
Angular’s templating system allows for quickly constructing Views within the Angular framework. A drawback of this system is that statically built components from within the template don’t expose some interesting and powerful API’s that can be used to create even more dynamic and responsive apps from within the Angular framework.

The following is an overview of some of the API’s for creating and manipulating components dynamically, and a basic implementation of a framework for creating rearrangeable smart components that can be drag and dropped into new configurations.

### The challenge
Implement a system for generating components in a container where the components in the container are not known ahead of time. Allow the components to be moved between containers while maintaining functionality.

### Relevent API's

#### [ViewRef](https://angular.io/api/core/ViewRef)
`ViewRef`’s instances are a layer of abstraction between Components and the DOM which helps Angular track the state of the Component structure. This is important when we attempt to relocate components throughout the app because it keeps Angulars’ View tree in sync with the rendered DOM structure.

#### [ComponentRef](https://angular.io/api/core/ComponentRef)
The ComponentRef is returned when dynamically generating a component using a ComponentFactory. It contains useful information that is not available from statically generated components, such as the hostRef. The hostRef is a reference to the ViewRef instance which connects the component to the Angular View tree.

#### [ViewContainerRef](https://angular.io/api/core/ViewContainerRef)
ViewContainerRef’s represent a container for ViewRefs, and exposes methods which can be used to manage the ViewRefs contained within it. Among those are createComponent which returns a ComponentRef instance, insert which allows the insertion of a ViewRef at a specified index, and detach which detaches a ViewRef from the container (the opposite of insert) but does not destroy it.

#### [ElementRef](https://angular.io/api/core/ElementRef)
ElementRef’s aren't used (explicitly) in this experiment, but on the surface they seem like they would be a useful API for dynamically manipulating an app. An important pitfall to avoid is simply using the Renderer and ElementRef’s to insert a Components DOM element into the target zone, because it not only breaks the abstraction layer Angular creates between components and how theyre rendered, but it also does not inform the framework of the reorganization of the DOM.

### Create a service for storing dragged components
The native drag and drop API doesn't support the transfer of complex structures, and is limited primarily to JSON serialized objects. This wont be enough for the purposes of this experiment, so we'll store a reference to the dragged item in the service.

Create a service with the properties:

```
dragItem: ComponentRef<DragItemComponent> = null;
onDragStart: Subject<ComponentRef<DragItemComponent>> = new Subject();
onDragEnd: Subject<ComponentRef<DragItemComponent>> = new Subject();
```

`dragItem` will contain a reference to the item that is currently being dragged, while `onDragStart` and `onDragEnd` will emit their respective events.

Create a subscription for each and use them to update the reference of `dragItem`.
```
this.onDragStart.subscribe((dragItem: ComponentRef<DragItemComponent>) => {
  this.dragItem = dragItem;
});

this.onDragEnd.subscribe((dragItem: ComponentRef<DragItemComponent>) => {
  this.dragItem = null;
});
```

### Create DragItemComponent
The Components that we're looking to make draggable will also host some additional information about themselves when they're created. To avoid creating and enforcing a common interface for components that should be 'draggable agnostic', we're going to create a wrapper Component instead.

Create a component with properties:

```
isDragged = false;
itemRef: ComponentRef<DragItemComponent> = null;
parentView: ViewContainerRef = null;
@HostBinding('attr.draggable') isActive = true;
@ViewChild('itemContainer', { read: ViewContainerRef }) itemContainer;
```

`isDragged` is a boolean value that will indicate whether or not the item is being dragged. This is primarily used for styling the component to visually indicate it's active.

`itemRef` is a reference to the `ComponentRef` returned from creating a Component dynamically. It contains vital information about the components current location in the View tree.

`parentView` is a reference to the parent `ViewContainerRef` that the item currently lives in. This will be useful to easily detach the component from its parents view when its dropped into a new location.
 
`isActive` is used to set the property of the `DragItemComponents` host element to draggable. The fact that its bound is also useful if we ever decide to disable the dragging of a certain component

`itemContainer` is the `ViewContainerRef` that will house the target dynamic component

We must also inject the `DragService` into this component, in order to inform the service of the `dragstart` and `dragend` events.

```
constructor(
  private dragService: DragService
) { }

@HostListener('dragstart', ['$event'])
onDragStart(event) {
  this.dragService.onDragStart.next(this.itemRef);
  
  /* Set a timer of 0 to append the callback to the event queue.
  * This is necessary so that the isDragged property isnt toggled before the item registers as dragged */
  Observable.timer(0).subscribe(() => {
    this.isDragged = true;
  })
}

@HostListener('dragend', ['$event'])
onDragEnd(event) {
  this.dragService.onDragEnd.next(this.itemRef);

  this.isDragged = false
}
```

### A strategy for creating Dynamic Components
The best practices for generating dynamic components outside of the template framework are relatively ambiguous. UI-Router employs a strategy where the component and some configuration is registered on the Router and dynamically generated from configs. We’ll implement a similar strategy to create a factory method on our service which generates the movable components from our own configs.

#### Create an interface to standardize the config structure
Ours will be very simple and straightforward

```
interface DragItemConfig {
  component: any;
  data?: any;
}

```

`component` contains a reference to the Component Class which can be used to resolve the Components factory

`data` contains optional data to be assigned onto the Component instance (as an alternative to the @Input syntax in static Components)

#### Create a facility for generating the actual component
A factory method on the service will take care of the dynamic creation of components:

```
createDragItem(item: DragItemConfig): ComponentRef<DragItemComponent> {
  const itemFactory = this.factoryResolver.resolveComponentFactory(DragItemComponent);
  const injector = ReflectiveInjector.resolveAndCreate([], this.injector);
  const itemRef: ComponentRef<DragItemComponent> = itemFactory.create(injector);

  itemRef.instance.itemRef = itemRef;

  const contentRef = itemRef.instance.itemContainer.createComponent(
    this.factoryResolver.resolveComponentFactory(item.component), 0, injector
  );

  if (item.data) {
    Object.assign(contentRef.instance, item.data);
  }

  return itemRef;
}
```

Actually resolving the factory and creating the component instance is a subject that has been beaten to death, the only unusual thing about this is that the component is created using its own `create` method instead of a `ViewContainer`s `createComponent` method. This creates a component instance that isnt attached to any views, which is useful for creating a reusable method for component generation.

Also a bit unusual, is assigning the ComponentRef reference to the Components own instance. This creates a circular reference chain which seems less than ideal, however its necessary for being able to easily register the ComponentRef on the `dragItem` property on the `DragService`

The `itemContainer` property on the `DragItemComponent` is a `ViewContainerRef` instance which can now be used to create an instance of the Component specified by the config passed in.

Finally, the optional data from the config gets assigned onto the instance of the newly created component, and the `ComponentRef` is returned.

### DropZoneComponent

#### A target for dropping Components

Contained on the `DropZoneComponent` are the properties:

```
hoverIndex: number = null;

@Input('sfDragItems') dragItems: DragItemConfig[] = [];

@HostBinding('class.target-zone') showTarget = false;

@ViewChild('dropZone', { read: ViewContainerRef }) dropZoneRef: ViewContainerRef;

dragStartSub: Subscription;
dragEndSub: Subscription;
```

`hoverIndex` indicates the index the item was last seen hovering over. This is an optimization property used to only move the component if its location has changed.

`dragItems` is a collection of configuration objects the DragZone will use to populate itself initially.

`showTarget` is used to change the state of the DragZone, to indicate whether an item is currently being dragged, and to reveal that it is an accepted drop location.

`dropZoneRef` is the `ViewContainerRef` which will be the parent view to the `DragItemComponent`s contained within it.

`dragStartSub` and `dragEndSub` are `Subscription`s which should be closed on destroy

The `DropZoneComponent` is responsible for handling the attaching and detaching of the dragged items View. This is takes place in `attachItemView`:

```
attachItemView(componentRef: ComponentRef<DragItemComponent>, index?: number) {
  if (index === this.hoverIndex && this.dropZoneRef === componentRef.instance.parentView) {
    return
  }

  if (componentRef.instance.parentView) {
    const curIdx = componentRef.instance.parentView.indexOf(componentRef.hostView);
    if (curIdx !== -1) {
      componentRef.instance.parentView.detach(curIdx);
    }
  }
  componentRef.instance.parentView = this.dropZoneRef;
  this.dropZoneRef.insert(componentRef.hostView, index);
}
```

The first check ensures that the Component to be attached is not already attached to the current DragZone in the same index location. The next check determines whether the Component is attached to a view at all, and detaches it if so. This prepares the Component for the final step, which is to insert the Component to the current DragZone at the specified index location, and update its parentView reference to reflect the new parent.

#### Handle the drag and drop

The logic for calculating the drop location requires knowledge of the current state of the DOM. Because interfacing directly with the DOM is discouraged outside of Directives in Angular, we'll do exactly that.

### DragZoneDirective

Use the `@HostBinding` decorator to register the `dragover` event on the directive. Create an Output on the directive which will essentially wrap the `dragover` event and return at what index the current mouse position indicates a drop should occur.

```
@Output('sfDragIndex') sfDragIndex: EventEmitter<number> = new EventEmitter();

constructor(
  private dragZone: ViewContainerRef
) { }


@HostListener('dragover', ['$event'])
onDragOver(event) {
  event.preventDefault();

  const index = this.calculateDropIndex(event);

  this.sfDragIndex.next(index);
}
```

Bind the sfDragIndex property to the DragZoneComponent:

```
<div
  sfDropZone
  (sfDragIndex)="dragIndexChanged($event)"
  class="drag-zone">
  <ng-container #dropZone></ng-container>
</div>
```

and use it to attach the dragged item to the hovered DropZone at the calculated index:

```
dragIndexChanged(index: number) {
  if (this.dragService.dragItem) {
    this.attachItemView(this.dragService.dragItem, index);

  }
  this.hoverIndex = index;
}
```

### Conclusion

While Angular provides a fantastic and easy to learn framework for creating relatively static predetermined views, the API for creating components dynamically can take some getting used to. Experiments that test the functionality of the lesser known or utilized API's such as those exposed by the `ComponentRef`, `ViewContainerRef` and `ViewRef` can lead to some pretty cool results and a deeper understanding of the less common but extremely powerful parts of the Angular ecosystem.
