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
        <v-toolbar-title>Recibir cliente anticipado<v-icon class="mx-2">mdi-truck-fast</v-icon></v-toolbar-title>
    </v-toolbar>
    <v-data-table-server v-if="filtroLugar" v-model:items-per-page="itemsPerPage" :headers="headers"
        :items="serverItems" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Registros por página" page-text="{0}-{1} de {2}"
        loading-text="Cargando, por favor espere">
        <template v-slot:[`item.FEC_EMI_NV`]="{ item }">
            <span>{{ formatearFecha(item.FEC_EMI_NV) }}</span>
        </template>

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

    <v-dialog v-model="dialogRecibir" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                Recibir cajas
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.DOCUMENTO" label="Guía" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.NV" label="NV" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.COD_CSF" label="Código" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.CAN_SOL_NV" label="Cantidad solicitada"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.CAN_DESPAC" label="Cantidad despachada"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.X_RECIBIR" label="Por recibir" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="6" sm="6">
                            <v-text-field v-model="guiaCliente" label="Guía cliente"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-number-input v-model="cantidadRecibida" :reverse="false" controlVariant="split"
                                label="Cantidad" :hideInput="false" inset variant="solo-filled" :min="1"
                                :max="editedItem.X_RECIBIR"></v-number-input>
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
                { title: 'Cantidad solicitada', key: 'CAN_SOL_NV', align: 'start', sortable: false },
                { title: 'Cantidad despachada', key: 'CAN_DESPAC', align: 'start', sortable: false },
                { title: 'Cantidad por armar', key: 'CAN_X_ARMAR', align: 'start', sortable: false },
                { title: 'Saldo por recibir', key: 'X_RECIBIR', align: 'start', sortable: false },
                { title: 'Guía', key: 'DOCUMENTO', align: 'start', sortable: false },
                { title: 'NV', key: 'NV', align: 'start', sortable: false },
                { title: 'Código', key: 'COD_CSF', align: 'start', sortable: false },
                { title: 'Tipo armado', key: 'TARMADO', align: 'start', sortable: false },
                { title: 'RUT Cliente', key: 'RUT', align: 'start', sortable: false },
                { title: 'Nombre Cliente', key: 'NOMBREI', align: 'start', sortable: false },
                { title: 'Descripción', key: 'DESCRI', align: 'start', sortable: false },
                { title: 'Fecha emitida', key: 'FEC_EMI_NV', align: 'start', sortable: false },
                { title: 'Fecha despacho', key: 'FEC_DESPAC', align: 'start', sortable: false },
            ],
            serverItems: [],
            loading: true,
            totalItems: 0,
            loadingBuscar: false,
            search: '',
            rutCliente: '',
            nombreCliente: '',
            dialogRecibir: false,
            editedItem: {},
            editedIndex: -1,
            guiaCliente: '',
            cantidadRecibida: null,
            numreq: '',
            codite: '',
            prestadores: [],
            lugares: [],
            filtroPrestador: null,
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
                // const usuario = JSON.parse(localStorage.getItem('user'));
                // let lugarArmado = usuario.digitador[0].lugarArmado;
                await axios.get(`/database/obtenerHR`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        rut: this.rutCliente,
                        nombre: this.nombreCliente,
                        idLugar: this.filtroLugar,
                        numreq: this.numreq,
                        codite: this.codite,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.serverItems = response.data.tabla;
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
            this.guiaCliente = '';
            this.cantidadRecibida = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        save() {
            if (this.cantidadRecibida === null || this.cantidadRecibida === 0) {
                this.$notify({
                    text: 'Debe ingresar una cantidad válida',
                    type: 'fallo'
                });
                return;
            }
            if (this.guiaCliente === '') {
                this.$notify({
                    text: 'Debe ingresar una guía válida',
                    type: 'fallo'
                });
                return;
            }
            const usuario = JSON.parse(localStorage.getItem('user'));
            let k = this.editedItem;
            let armado = {
                TARMADO: parseInt(k.TARMADO),
                CODREQ: k.TM,
                GTARMADO: "Venta",
                IDLUGARARMADO: String(this.filtroLugar),
                LUGARDEARMADO: this.lugares.find(l => l.id === this.filtroLugar).nombre,
                CENTRO_BOD: k.CENTRO,
                CIUDADES: this.lugares.find(l => l.id === this.filtroLugar).ciudad,
                REGION: String(this.lugares.find(l => l.id === this.filtroLugar).region),
                ZONA: this.lugares.find(l => l.id === this.filtroLugar).zona.nombre,
                OC: 14,
                FACTURA_JDE: "",
                NUMREQ: String(k.NV),
                CODITE: k.COD_CSF,
                GUIA_CSF: String(k.DOCUMENTO),
                TGUIA: k.TIP_GUIA,
                IDECLI: k.NOMBREI,
                RUTCLI: k.RUT,
                FECHA_OPERACION: new Date().toISOString().split('T')[0],
                TIPO_OPERACION: "C_RECIB_CLIE_ANT",
                TIPO: "CLIE_ANT",
                CAN_X_ARMAR: parseInt(this.cantidadRecibida),
                USUARIO_PRESTADOR: usuario.correo,
                PRESTADOR: this.prestadores.find(p => p.id === this.filtroPrestador).nombre,
                FECHA_HRS_OPERACION: new Date(),
                TARMADO_GLOSA: "Precio incluye armado Cj. (Arma CSF)",
                PERIODO: String(k.PERIODO),
                PRESTADORID: this.filtroPrestador,
            };
            const armadokardex = {
                armado: armado,
                CANSOL: k.CAN_SOL_NV,
                CANENT: k.CANENT,
                CANTOT_GUIA: k.CAN_DESPAC,
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
                    this.editedItem.CAN_X_ARMAR = parseInt(this.editedItem.CAN_X_ARMAR) + parseInt(this.cantidadRecibida);
                    this.editedItem.X_RECIBIR = parseInt(this.editedItem.X_RECIBIR) - parseInt(this.cantidadRecibida);
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem);
                    this.cantidadRecibida = null;
                    this.guiaCliente = '';
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
            this.dialogRecibir = true;
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            date.setDate(date.getDate() + 1);
            return date.toLocaleDateString('es-CL');
        },
    },
};
</script>
