import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DragItemComponent } from './drag-item.component';

describe('DragItemComponent', () => {
  let component: DragItemComponent;
  let fixture: ComponentFixture<DragItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
