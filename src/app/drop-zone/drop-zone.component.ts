import {
  ComponentRef, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef,
  ViewRef, ViewChild
} from '@angular/core';
import {DragService} from '../drag.service';
import {DragItemComponent} from '../drag-item/drag-item.component';
import {DragItemConfig} from '../drag-item/drag-item-config';

@Component({
  selector: 'sf-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.less']
})

export class DropZoneComponent implements OnInit, OnChanges {

  hoverIndex:number = null;

  @Input('sfDragItems') dragItems: DragItemConfig[] = [];

  @HostBinding('class.target-zone') showTarget = false;

  @ViewChild('dropZone', { read: ViewContainerRef }) dropZoneRef: ViewContainerRef;

  constructor(
    private dragService: DragService
  ) { }

  ngOnInit() {
    this.dragService.onDragStart.subscribe((item: ComponentRef<DragItemComponent>) => {
      this.showTarget = true;
    });

    this.dragService.onDragEnd.subscribe((item: ComponentRef<DragItemComponent>) => {
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

  buildItem(item: DragItemConfig) {
    const itemRef = this.dragService.createDragItem(item);
    /* createDragItem returns a componentRef that isnt attached to any view. Attach it to the dropzone*/
    this.attachItemView(itemRef);
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

  dragIndexChanged(index: number) {
    if (this.dragService.dragItem) {
      this.attachItemView(this.dragService.dragItem, index);

    }
    this.hoverIndex = index;
  }
}
