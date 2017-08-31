import {DragItemConfig} from './drag-item/drag-item-config';
import {SampleSmartGuyComponent} from './sample-smart-guy/sample-smart-guy.component';

export const dragViewOne: DragItemConfig[] = [
  {
    component: SampleSmartGuyComponent,
    data: {value: 'foo'}
  },
  {
    component: SampleSmartGuyComponent,
    data: {value: 'bar'}
  },
  {
    component: SampleSmartGuyComponent,
    data: {value: 'lipsum'}
  }
];
