import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EditingState {
  componentId: string;
  rowId: any;
  isNewRow: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EditingStateService {
  private currentEditingState = new BehaviorSubject<EditingState | null>(null);
  private cancelCallbacks: Map<string, () => void> = new Map();

  constructor() {}

  getCurrentEditingState(): Observable<EditingState | null> {
    return this.currentEditingState.asObservable();
  }

  getCurrentEditingStateValue(): EditingState | null {
    return this.currentEditingState.value;
  }

  startEditing(
    componentId: string,
    rowId: any,
    isNewRow: boolean = false,
    cancelCallback?: () => void
  ): void {
    const currentState = this.currentEditingState.value;

    if (
      currentState &&
      (currentState.componentId !== componentId ||
        currentState.rowId !== rowId ||
        isNewRow)
    ) {
      this.cancelEditing();
    }

    if (cancelCallback) {
      this.cancelCallbacks.set(componentId, cancelCallback);
    }

    const newState = {
      componentId,
      rowId,
      isNewRow,
    };
    this.currentEditingState.next(newState);
  }

  cancelEditing(): void {
    const currentState = this.currentEditingState.value;

    if (currentState && this.cancelCallbacks.has(currentState.componentId)) {
      const callback = this.cancelCallbacks.get(currentState.componentId);
      if (callback) {
        callback();
      }
    }

    this.currentEditingState.next(null);
  }

  registerCancelCallback(componentId: string, callback: () => void): void {
    this.cancelCallbacks.set(componentId, callback);
  }

  unregisterCancelCallback(componentId: string): void {
    this.cancelCallbacks.delete(componentId);
  }

  isRowEditing(componentId: string, rowId: any): boolean {
    const currentState = this.currentEditingState.value;
    return (
      currentState !== null &&
      currentState.componentId === componentId &&
      currentState.rowId === rowId
    );
  }

  isComponentEditing(componentId: string): boolean {
    const currentState = this.currentEditingState.value;
    return currentState !== null && currentState.componentId === componentId;
  }

  isAnyRowEditing(): boolean {
    return this.currentEditingState.value !== null;
  }

  getEditingComponentId(): string | null {
    const currentState = this.currentEditingState.value;
    return currentState ? currentState.componentId : null;
  }
}
