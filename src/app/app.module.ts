import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DragItemComponent } from './drag-item/drag-item.component';
import { DropZoneDirective } from './drop-zone.directive';
import {DragService} from './drag.service';
import { SampleSmartGuyComponent } from './sample-smart-guy/sample-smart-guy.component';
import { DropZoneComponent } from './drop-zone/drop-zone.component';

@NgModule({
  declarations: [
    AppComponent,
    DragItemComponent,
    DropZoneDirective,
    SampleSmartGuyComponent,
    DropZoneComponent,
  ],
  entryComponents: [
    SampleSmartGuyComponent,
    DragItemComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    DragService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
