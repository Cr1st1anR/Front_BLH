import { TestBed } from '@angular/core/testing';

import { LineaAmigaService } from './linea-amiga.service';

describe('LineaAmigaService', () => {
  let service: LineaAmigaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineaAmigaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
