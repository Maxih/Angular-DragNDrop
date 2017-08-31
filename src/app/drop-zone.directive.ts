import {Directive, EventEmitter, HostListener, Output, ViewContainerRef} from '@angular/core';


@Directive({
  selector: '[sfDropZone]'
})
export class DropZoneDirective  {

  ghostIdx: number = null;

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


  calculateDropIndex(event): number {
    const offsetTop = this.dragZone.element.nativeElement.getBoundingClientRect().top;
    const mouseY = event.pageY;
    const localMouseY = mouseY - offsetTop;

    let curHeight = 0;
    let dropIndex = null;
    for (let i = 0; i < this.dragZone.element.nativeElement.children.length; i++) {
      const height = this.dragZone.element.nativeElement.children[i].clientHeight;
      const halfHeight = height / 2;

      if (localMouseY >= curHeight && localMouseY < curHeight + halfHeight) {
        if (this.ghostIdx === i - 1) {
          /* Top half of the element following the dragItem */
          dropIndex = this.ghostIdx;
        } else {
          /* Top half of the dragItem */
          dropIndex = i;
        }
        break;
      } else if (localMouseY >= curHeight + halfHeight && localMouseY <= curHeight + height) {
        if (this.ghostIdx === i) {
          /* Bottom half of the dragItem */
          dropIndex = i;
        } else if (this.ghostIdx === i - 1) {
          /* Bottom half of the one following the dragItem */
          dropIndex = i;
        } else {
          /* Bottom half of the one before the dragItem */
          dropIndex = i + 1;
        }
        break;
      }
      curHeight += height;
    }

    /* In case the index doesnt make sense, set it to be the last element */
    if (dropIndex >= this.dragZone.element.nativeElement.children.length) {
      dropIndex = this.dragZone.element.nativeElement.children.length - 1;
    }

    this.ghostIdx = dropIndex;

    return dropIndex;
  }
}
