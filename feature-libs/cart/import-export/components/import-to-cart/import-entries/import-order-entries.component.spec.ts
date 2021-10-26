import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { I18nTestingModule, RoutingService } from '@spartacus/core';
import { LAUNCH_CALLER, LaunchDialogService } from '@spartacus/storefront';
import { of } from 'rxjs';
import { ImportOrderEntriesComponent } from './import-order-entries.component';
import createSpy = jasmine.createSpy;

class MockLaunchDialogService implements Partial<LaunchDialogService> {
  openDialogAndSubscribe(
    _caller: LAUNCH_CALLER,
    _openElement?: ElementRef,
    _data?: any
  ) {}
}

class ContextService {
  getEntries = createSpy('addEntries');
}

const contextService = new ContextService();

class MockRoutingService {
  getContext = createSpy('getContext').and.returnValue(of(contextService));
}

describe('ImportOrderEntriesComponent', () => {
  let component: ImportOrderEntriesComponent;
  let fixture: ComponentFixture<ImportOrderEntriesComponent>;
  let launchDialogService: LaunchDialogService;
  let el: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [ImportOrderEntriesComponent],
      providers: [
        { provide: LaunchDialogService, useClass: MockLaunchDialogService },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportOrderEntriesComponent);
    component = fixture.componentInstance;

    launchDialogService = TestBed.inject(LaunchDialogService);

    spyOn(launchDialogService, 'openDialogAndSubscribe').and.stub();

    fixture.detectChanges();
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger an open dialog to import CSV', () => {
    component.openDialog(contextService);
    expect(launchDialogService.openDialogAndSubscribe).toHaveBeenCalledWith(
      LAUNCH_CALLER.IMPORT_TO_CART,
      component.element,
      { context: contextService }
    );
  });

  it('should show import button', () => {
    const button = el.queryAll(By.css('.link.cx-action-link'));
    expect(button.length).toEqual(1);
  });
});
