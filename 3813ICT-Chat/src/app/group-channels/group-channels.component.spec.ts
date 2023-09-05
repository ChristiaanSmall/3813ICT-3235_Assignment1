import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupChannelsComponent } from './group-channels.component';

describe('GroupChannelsComponent', () => {
  let component: GroupChannelsComponent;
  let fixture: ComponentFixture<GroupChannelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupChannelsComponent]
    });
    fixture = TestBed.createComponent(GroupChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
