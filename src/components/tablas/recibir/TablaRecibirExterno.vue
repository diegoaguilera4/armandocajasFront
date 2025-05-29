<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips clearable
                    :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroLugar" label="Lugar de armado" chips clearable
                    :items="lugares" item-title="nombre" item-value="id">
                </v-select>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="rutCliente" prepend-inner-icon="mdi-magnify" label="RUT Cliente" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="nombreCliente" prepend-inner-icon="mdi-magnify" label="Nombre Cliente"
                    hide-details clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="numreq" prepend-inner-icon="mdi-magnify" label="NV" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="codite" prepend-inner-icon="mdi-magnify" label="Código" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-toolbar flat style="background-color: #006398; color: white;">
        <v-toolbar-title>Recibir externo<v-icon class="mx-2">mdi-truck-fast</v-icon></v-toolbar-title>
        <v-dialog v-model="dialogRecibir" max-width="500px">
            <template v-slot:activator="{ props }">
                <v-btn v-if="filtroLugar" append-icon="mdi-package-variant-plus" variant="elevated" color="secondary"
                    style="margin-right: 20px" dark v-bind="props">
                    agregar
                </v-btn>
            </template>
            <v-card style="border-radius: 20px; padding: 10px;">
                <v-card-title>
                    <span class="text-center">Agregar producto externo</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="6" lg="6" md="6" sm="6">
                                <v-text-field v-model="editedItem.RUTCLI" label="RUT cliente"
                                    :rules="[rules.required]"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="6" md="6" sm="6">
                                <v-text-field v-model="editedItem.IDECLI" label="Nombre cliente"
                                    :rules="[rules.required]"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="6" md="6" sm="6">
                                <v-text-field v-model="editedItem.CARTONERA" label="Cartonera"
                                    :rules="[rules.required]"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="6" md="6" sm="6">
                                <v-text-field v-model="editedItem.TIPO_CAJA" label="Tipo de caja"
                                    :rules="[rules.required]"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="editedItem.DESCRIPCION" label="Descripción"
                                    :rules="[rules.required]"></v-text-field>
                            </v-col>

                            <v-col cols="12" lg="12" md="12" sm="12">
                                <v-number-input v-model="cantidadRecibida" :reverse="false" controlVariant="split"
                                    label="Cantidad a recibir" :hideInput="false" inset variant="solo-filled"
                                    :min="1"></v-number-input>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" variant="elevated" @click="close">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" variant="elevated" @click="save">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
    <v-data-table-server v-if="filtroLugar" v-model:items-per-page="itemsPerPage" :headers="headers"
        :items="serverItems" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Registros por página" page-text="{0}-{1} de {2}"
        loading-text="Cargando, por favor espere">

        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Recibir cajas" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="recibirCajas(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogAgregar" max-width="500px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">Agregar producto externo</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="6" lg="6" md="6" sm="6">
                            <v-text-field v-model="editedItem.RUTCLI" label="RUT cliente" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" lg="6" md="6" sm="6">
                            <v-text-field v-model="editedItem.IDECLI" label="Nombre cliente" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" lg="6" md="6" sm="6">
                            <v-text-field v-model="editedItem.CARTONERA" label="Cartonera" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" lg="6" md="6" sm="6">
                            <v-text-field v-model="editedItem.TIPO_CAJA" label="Tipo de caja" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="editedItem.DESCRIPCION" label="Descripción" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" lg="12" md="12" sm="12">
                            <v-number-input v-model="cantidadRecibida" :reverse="false" controlVariant="split"
                                label="Cantidad a recibir" :hideInput="false" inset variant="solo-filled"
                                :min="1"></v-number-input>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="close">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="elevated" @click="save">
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            itemsPerPage: 10,
            headers: [
                { title: 'Acciones', key: 'actions', sortable: false },
                { title: 'Cantidad por armar', key: 'CAN_X_ARMAR', align: 'start', sortable: false },
                { title: 'NV', key: 'NUMREQ', align: 'start', sortable: false },
                { title: 'Código', key: 'CODITE', align: 'start', sortable: false },
                { title: 'Nombre cliente', key: 'IDECLI', align: 'start', sortable: false },
                { title: 'RUT cliente', key: 'RUTCLI', align: 'start', sortable: false },
                { title: 'Cartonera', key: 'CARTONERA', align: 'start', sortable: false },
                { title: 'Tipo de caja', key: 'TIPO_CAJA', align: 'start', sortable: false },
                { title: 'Descripción', key: 'DESCRIPCION', align: 'start', sortable: false },
            ],
            serverItems: [],
            loading: true,
            totalItems: 0,
            loadingBuscar: false,
            search: '',
            rutCliente: '',
            nombreCliente: '',
            dialogRecibir: false,
            editedItem: {
                NUMREQ: '',
                CODITE: '',
                IDECLI: '',
                RUTCLI: '',
                CARTONERA: '',
                TIPO_CAJA: '',
                DESCRIPCION: '',
            },
            defaultItem: {
                NUMREQ: '',
                CODITE: '',
                IDECLI: '',
                RUTCLI: '',
                CARTONERA: '',
                TIPO_CAJA: '',
                DESCRIPCION: '',
            },
            editedIndex: -1,
            cantidadRecibida: null,
            numreq: '',
            codite: '',
            dialogAgregar: false,
            rules: {
                required: value => !!value || 'Campo requerido.',
                rut: value => {
                    const pattern = /^[0-9]+-[0-9kK]{1}$/;
                    return pattern.test(value) || 'RUT inválido';
                },
            },
            filtroPrestador: null,
            prestadores: [],
            lugares: [],
            filtroLugar: null,
        };
    },
    watch: {
        rutCliente() {
            this.search = String(Date.now());
        },
        nombreCliente() {
            this.search = String(Date.now());
        },
        numreq() {
            this.search = String(Date.now());
        },
        codite() {
            this.search = String(Date.now());
        },
        dialogRecibir(val) {
            val || this.close();
        },
        filtroPrestador() {
            this.search = String(Date.now());
            this.onPrestadorChange(this.filtroPrestador);
        },
        filtroLugar() {
            this.search = String(Date.now());
        },
    },
    async created() {
        await this.obtenerPrestadores();
    },
    methods: {
        onPrestadorChange(prestadorId) {
            // Cargar los lugares del prestador seleccionado
            const prestadorSeleccionado = this.prestadores.find(p => p.id === prestadorId);
            if (prestadorSeleccionado) {
                this.lugares = prestadorSeleccionado.lugares; // Asumiendo que cada prestador tiene una propiedad 'lugares'
            } else {
                this.lugares = [];
            }
            this.filtroLugar = null; // Resetear el filtro de lugar
        },
        async obtenerPrestadores() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/prestadores`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.prestadores = response.data;
                }).catch(error => {
                    console.error('Error al obtener prestadores', error);
                });
            } catch (error) {
                console.error('Error al obtener prestadores', error);
            }
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let rutAux = this.rutCliente.replace(/-/g, '');
                await axios.get(`/armadosaldo/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        rut: rutAux,
                        nombre: this.nombreCliente,
                        idLugar: this.filtroLugar,
                        tipo: 'EXT',
                        numreq: this.numreq,
                        codite: this.codite,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.serverItems = response.data.armadoSaldos;
                    this.totalItems = response.data.total;
                }).catch(error => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        close() {
            this.dialogRecibir = false;
            this.dialogAgregar = false;
            this.cantidadRecibida = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        save() {
            if (this.cantidadRecibida === null || this.cantidadRecibida <= 0) {
                this.$notify({
                    text: 'Debe ingresar una cantidad válida',
                    type: 'fallo'
                });
                return;
            }
            let k = this.editedItem;
            let usuario = JSON.parse(localStorage.getItem('user'));
            //agregar - a rut
            let armado = {
                TARMADO: 1,
                CODREQ: 'E',
                GTARMADO: "Externo",
                IDLUGARARMADO: String(this.filtroLugar),
                LUGARDEARMADO: this.lugares.find(l => l.id === this.filtroLugar).nombre,
                CENTRO_BOD: '',
                CIUDADES: this.lugares.find(l => l.id === this.filtroLugar).ciudad,
                REGION: String(this.lugares.find(l => l.id === this.filtroLugar).region),
                ZONA: this.lugares.find(l => l.id === this.filtroLugar).zona.nombre,
                OC: 14,
                FACTURA_JDE: '',
                NUMREQ: k.CARTONERA,
                CODITE: k.CARTONERA,
                GUIA_CSF: '',
                TGUIA: '',
                IDECLI: k.IDECLI,
                RUTCLI: k.RUTCLI,
                FECHA_OPERACION: new Date().toISOString().split('T')[0],
                TIPO_OPERACION: "C_RECIB_EXT",
                TIPO: "EXT",
                CAN_X_ARMAR: parseInt(this.cantidadRecibida),
                GUIA_RECIBIDA_CLIENTE: '',
                USUARIO_PRESTADOR: usuario.correo,
                PRESTADOR: this.prestadores.find(p => p.id === this.filtroPrestador).nombre,
                FECHA_HRS_OPERACION: new Date(),
                TARMADO_GLOSA: "Caja externa",
                PERIODO: String(this.obtenerPeriodo()),
                PRESTADORID: this.filtroPrestador,
                CARTONERA: k.CARTONERA,
                TIPO_CAJA: k.TIPO_CAJA,
                DESCRIPCION: k.DESCRIPCION,
            };
            const armadokardex = {
                armado: armado,
                CANSOL: 0,
                CANENT: 0,
                CANTOT_GUIA: 0,
            }
            this.crearArmadoKardex(armadokardex);
        },
        async crearArmadoKardex(armadokardex) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/armadokardex`, armadokardex, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    // this.editedItem.CAN_X_ARMAR = parseInt(this.editedItem.CAN_X_ARMAR) + parseInt(this.cantidadRecibida);
                    // this.editedItem.X_RECIBIR = parseInt(this.editedItem.X_RECIBIR) - parseInt(this.cantidadRecibida);
                    this.search = String(Date.now());
                    this.cantidadRecibida = null;
                    this.$notify({
                        text: 'Cantidad recibida con éxito',
                        type: 'exito'
                    });
                    this.close();
                }).catch(error => {
                    console.error('Error al crear el armado kardex', error);
                });
            } catch (error) {
                console.error('Error al crear el armado kardex', error);
            }
        },
        recibirCajas(item) {
            this.dialogAgregar = true;
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            date.setDate(date.getDate() + 1);
            return date.toLocaleDateString('es-CL');
        },
        formatearRut(rut) {
            //agregar - antes del ultimo numero
            return (rut.slice(0, -1) + '-' + rut.slice(-1)).replace(/^0+/, '');
        },
        obtenerPeriodo() {
            //pasar date a AAAAMM
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth();
            if (month < 10) {
                month = '0' + month;
            }
            return year + month;
        }
    },
};
</script>
