import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptacionListComponent } from './captacion-list.component';

describe('CaptacionListComponent', () => {
  let component: CaptacionListComponent;
  let fixture: ComponentFixture<CaptacionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptacionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptacionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
