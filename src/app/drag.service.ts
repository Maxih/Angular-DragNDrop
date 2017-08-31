import {ComponentFactoryResolver, ComponentRef, Injectable, Injector, ReflectiveInjector} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DragItemComponent} from './drag-item/drag-item.component';
import {DragItemConfig} from './drag-item/drag-item-config';

@Injectable()
export class DragService {

  dragItem: ComponentRef<DragItemComponent> = null;
  onDragStart: Subject<ComponentRef<DragItemComponent>> = new Subject();
  onDragEnd: Subject<ComponentRef<DragItemComponent>> = new Subject();

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {
    this.onDragStart.subscribe((dragItem: ComponentRef<DragItemComponent>) => {
      this.dragItem = dragItem;
    });

    this.onDragEnd.subscribe((dragItem: ComponentRef<DragItemComponent>) => {
      this.dragItem = null;
    });
  }

  createDragItem(item: DragItemConfig): ComponentRef<DragItemComponent> {
    const itemFactory = this.factoryResolver.resolveComponentFactory(DragItemComponent);
    const injector = ReflectiveInjector.resolveAndCreate([], this.injector);
    const itemRef: ComponentRef<DragItemComponent> = itemFactory.create(injector);

    itemRef.instance.itemRef = itemRef;

    const contentRef = itemRef.instance.itemContainer.createComponent(
      this.factoryResolver.resolveComponentFactory(item.component)
    );

    if (item.data) {
      Object.assign(contentRef.instance, item.data);
    }

    return itemRef;
  }
}
