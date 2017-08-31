import { Component } from '@angular/core';
import {dragViewOne} from './drag-config';

@Component({
  selector: 'sf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'app';

  dragViewOne = [...dragViewOne]
}
