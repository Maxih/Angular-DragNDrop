import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleSmartGuyComponent } from './sample-smart-guy.component';

describe('SampleSmartGuyComponent', () => {
  let component: SampleSmartGuyComponent;
  let fixture: ComponentFixture<SampleSmartGuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleSmartGuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleSmartGuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
