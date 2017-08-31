import {Component, ComponentRef, HostBinding, HostListener, ViewChild, ViewContainerRef, ViewRef} from '@angular/core';
import {DragService} from '../drag.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';

@Component({
  selector: 'sf-drag-item',
  templateUrl: './drag-item.component.html',
  styleUrls: ['./drag-item.component.less']
})
export class DragItemComponent {

  /* Whether or not the item is currently being dragged */
  isDragged = false;

  /* Maintain a reference to the components hostView */
  public itemRef: ComponentRef<DragItemComponent> = null;

  /* Maintain a reference to the parent */
  public parentView: ViewContainerRef = null;

  /* Make the actual element draggable and allow it to be toggled */
  @HostBinding('attr.draggable') isActive = true;

  /* Read the container in which to place the item content */
  @ViewChild('itemContainer', { read: ViewContainerRef }) itemContainer;

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
}
