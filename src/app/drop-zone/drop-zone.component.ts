import {
  ComponentRef, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef,
  ViewRef, ViewChild, OnDestroy
} from '@angular/core';
import {DragService} from '../drag.service';
import {DragItemComponent} from '../drag-item/drag-item.component';
import {DragItemConfig} from '../drag-item/drag-item-config';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'sf-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.less']
})

export class DropZoneComponent implements OnInit, OnChanges, OnDestroy {

  hoverIndex: number = null;

  @Input('sfDragItems') dragItems: DragItemConfig[] = [];

  @HostBinding('class.target-zone') showTarget = false;

  @ViewChild('dropZone', { read: ViewContainerRef }) dropZoneRef: ViewContainerRef;

  dragStartSub: Subscription;
  dragEndSub: Subscription;

  constructor(
    private dragService: DragService
  ) { }

  ngOnInit() {
    this.dragStartSub = this.dragService.onDragStart.subscribe((item: ComponentRef<DragItemComponent>) => {
      this.showTarget = true;
    });

    this.dragEndSub = this.dragService.onDragEnd.subscribe((item: ComponentRef<DragItemComponent>) => {
      this.showTarget = false;
    })

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dragItems) {
      this.dropZoneRef.clear();
      changes.dragItems.currentValue.forEach((item) => {
        this.buildItem(item);
      });
    }
  }

  ngOnDestroy() {
    this.dragStartSub.unsubscribe();
    this.dragEndSub.unsubscribe();
  }

  buildItem(item: DragItemConfig) {
    const itemRef = this.dragService.createDragItem(item);
    /* createDragItem returns a componentRef that isnt attached to any view. Attach it to the dropzone*/
    this.attachItemView(itemRef);
  }

  dragIndexChanged(index: number) {
    if (this.dragService.dragItem) {
      this.attachItemView(this.dragService.dragItem, index);

    }
    this.hoverIndex = index;
  }

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
}
