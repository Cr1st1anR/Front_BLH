import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CustomerService {
  getData() {
    return [
      {
        fecha: '15/05/2024',
        ruta: 'Recoleccion de leche humana (mañana)',
        placaVehiculo: 'OAK296',
        conductor: 'Armando Jaramillo',
        kmInicial: 130115,
        kmFinal: 130150,
        horaSalida: '7:26',
        horaLlegada: '11:35',
        responsableTecnico: 'Maria Benavides',
        cargo: 'Auxiliar Enfermeria',
        totalVisitas: 6,
        volumenLecheRecolectada: 1870,

        noCaja: 1,
        hSalida: '4:39',
        tSalida: -19.1,
        tCasa1: -21.5,
        id: 1,

        casaNo: 1,
        codigo: 1711,
        nombre: 'Daniela Toro',
        direccion: 'Pandiaco',
        telefono1: 3123451221,
        telefono2: 3016786565,
        observaciones: 'e',

        // noFrasco: 1,
        // volumenEstimado: 250,
        // fechaExtraccion: '2025-05-01',
        // tipoFrasco: 'Vidrio',
        // noTermo: 3,
        // congelador: 1,
        // gaveta: 1,
      },
      {
        fecha: '15/05/2024',
        ruta: 'Recoleccion de leche humana (mañana)',
        placaVehiculo: 'OAK296',
        conductor: 'Armando Jaramillo',
        kmInicial: 130115,
        kmFinal: 130150,
        horaSalida: '7:26',
        horaLlegada: '11:35',
        responsableTecnico: 'Maria Benavides',
        cargo: 'Auxiliar Enfermeria',
        totalVisitas: 6,
        volumenLecheRecolectada: 1870,

        noCaja: 1,
        tSalida: -19.4,
        hSalida: '4:30',
        tCasa1: -21,
        id: 2,

        casaNo: 2,
        codigo: 1234,
        nombre: 'Valery Sofia',
        direccion: 'San diego norte',
        telefono1: 3123990221,
        telefono2: 3099986565,
        observaciones: 'r',

        // noFrasco: 2,
        // volumenEstimado: 300,
        // fechaExtraccion: '2025-05-02',
        // tipoFrasco: 'Plástico',
        // noTermo: 2,
        // congelador: 2,
        // gaveta: 2,
      },
      {
        fecha: '15/05/2024',
        ruta: 'Recoleccion de leche humana (mañana)',
        placaVehiculo: 'OAK296',
        conductor: 'Armando Jaramillo',
        kmInicial: 130115,
        kmFinal: 130150,
        horaSalida: '7:26',
        horaLlegada: '11:35',
        responsableTecnico: 'Maria Benavides',
        cargo: 'Auxiliar Enfermeria',
        totalVisitas: 6,
        volumenLecheRecolectada: 1870,

        noCaja: 1,
        tSalida: -19.4,
        hSalida: '4:30',
        tCasa1: -21,
        id: 3,

        casaNo: 3,
        codigo: 7987,
        nombre: 'Laura Sofia',
        direccion: 'San diego sur',
        telefono1: 3123990555,
        telefono2: 3099986111,
        observaciones: 'rr',

        // noFrasco: 3,
        // volumenEstimado: 400,
        // fechaExtraccion: '2024-05-07',
        // tipoFrasco: 'Plástico',
        // noTermo: 2,
        // congelador: 2,
        // gaveta: 2,
      },
      {
        fecha: '15/05/2024',
        ruta: 'Recoleccion de leche humana (mañana)',
        placaVehiculo: 'OAK296',
        conductor: 'Armando Jaramillo',
        kmInicial: 130115,
        kmFinal: 130150,
        horaSalida: '7:26',
        horaLlegada: '11:35',
        responsableTecnico: 'Maria Benavides',
        cargo: 'Auxiliar Enfermeria',
        totalVisitas: 6,
        volumenLecheRecolectada: 1870,

        noCaja: 1,
        tSalida: -19.4,
        hSalida: '4:30',
        tCasa1: -21,
        id: 4,

        casaNo: 4,
        codigo: 9991,
        nombre: 'Luisa Solarte',
        direccion: 'San diego oeste',
        telefono1: 3113234768,
        telefono2: 3056078970,
        observaciones: 'rrr',

        // noFrasco: 4,
        // volumenEstimado: 500,
        // fechaExtraccion: '2023-05-02',
        // tipoFrasco: 'Plástico',
        // noTermo: 2,
        // congelador: 5,
        // gaveta: 2,
      },

      // {
      //     id: 1001,
      //     name: 'Josephine Darakjy',
      //     country: {
      //         name: 'Egypt',
      //         code: 'eg'
      //     },
      //     company: 'Chanay, Jeffrey A Esq',
      //     date: '2019-02-09',
      //     status: 'proposal',
      //     verified: true,
      //     activity: 0,
      //     representative: {
      //         name: 'Amy Elsner',
      //         image: 'amyelsner.png'
      //     },
      //     balance: 82429
      // },
    ];
  }

  getFrascosData(casaNo: number): Promise<any[]> {
    const frascos = [
      {
        noFrasco: 1,
        volumenEstimado: 500,
        fechaExtraccion: '2025-05-01',
        tipoFrasco: 'Vidrio',
        noTermo: 1,
        congelador: 'A',
        gaveta: 1,
      },
      {
        noFrasco: 1,
        volumenEstimado: 300,
        fechaExtraccion: '2025-05-02',
        tipoFrasco: 'Plástico',
        noTermo: 2,
        congelador: 'B',
        gaveta: 2,
      },
      // Más datos de ejemplo...
    ];
    return Promise.resolve(frascos.filter((f) => f.noTermo === casaNo)); // Filtra por casaNo
  }

  constructor(private http: HttpClient) {}

  getCustomersMini() {
    return Promise.resolve(this.getData().slice(0, 5));
  }

  getCustomersSmall() {
    return Promise.resolve(this.getData().slice(0, 10));
  }

  getCustomersMedium() {
    return Promise.resolve(this.getData().slice(0, 50));
  }

  getCustomersLarge() {
    return Promise.resolve(this.getData().slice(0, 200));
  }

  getCustomersXLarge() {
    return Promise.resolve(this.getData());
  }

  getCustomers(params?: any) {
    return this.http
      .get<any>('https://www.primefaces.org/data/customers', { params: params })
      .toPromise();
  }
}
