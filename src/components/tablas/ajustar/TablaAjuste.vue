<template>
    <v-row style="margin:5px;">
        <v-col cols="6" lg="2" md="3" sm="4">
            <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips clearable
                :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                        :subtitle="item.raw.nombre"></v-list-item>
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
            <v-text-field v-model="nombreCliente" prepend-inner-icon="mdi-magnify" label="Nombre Cliente" hide-details
                clearable></v-text-field>
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
    <v-toolbar flat style="background-color: #006398; color: white;">
        <v-toolbar-title v-if="this.tipo === 'Positivo'">Ajuste positivo<v-icon
                class="mx-2">mdi-pen-plus</v-icon></v-toolbar-title>
        <v-toolbar-title v-if="this.tipo === 'Negativo'">Ajuste negativo<v-icon
                class="mx-2">mdi-pen-minus</v-icon></v-toolbar-title>

    </v-toolbar>
    <v-data-table-server v-if="filtroLugar" v-model:items-per-page="itemsPerPage" :headers="headers"
        :items="serverItems" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Registros por página" page-text="{0}-{1} de {2}"
        loading-text="Cargando, por favor espere" :items-per-page-options="[10, 25, 50, totalItems]">

        <template v-slot:[`item.FECHA_I`]="{ item }">
            <span>{{ formatearFecha(item.FECHA_I) }}</span>
        </template>
        <template v-slot:[`item.FECHA_U`]="{ item }">
            <span>{{ formatearFecha(item.FECHA_U) }}</span>
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
                Ajuste {{ tipo.toLocaleLowerCase() }}
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col v-if="editedItem.GUIA_CSF != ''" cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.GUIA_CSF" label="Guía" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.NUMREQ" label="NV" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.CODITE" label="Código" readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="4" sm="4">
                            <v-text-field v-model="editedItem.CANSOL" label="Cantidad solicitada"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="6" md="6" sm="6">
                            <v-text-field v-model="editedItem.CAN_X_ARMAR" label="Cantidad recibida"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-number-input v-model="cantidadRecibida" :reverse="false" controlVariant="split"
                                label="Ajuste" :hideInput="false" inset variant="solo-filled" :min="1"
                                v-bind="{ max: tipo === 'Positivo' ? undefined : editedItem.CAN_X_ARMAR }">
                            </v-number-input>
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
    props: {
        tipo: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            itemsPerPage: 10,
            headers: [
                { title: 'Acciones', key: 'actions', sortable: false },
                { title: 'Cantidad por armar', key: 'CAN_X_ARMAR', align: 'start', sortable: false },
                { title: 'Cantidad solicitada', key: 'CANSOL', align: 'start', sortable: false },
                //{ title: 'Cantidad despachada', key: 'CAN_DESPAC', align: 'start', sortable: false },
                //{ title: 'Cantidad entregada', key: 'CANENT', align: 'start', sortable: false },
                { title: 'Guía', key: 'GUIA_CSF', align: 'start', sortable: false },
                { title: 'NV', key: 'NUMREQ', align: 'start', sortable: false },
                { title: 'Código', key: 'CODITE', align: 'start', sortable: false },
                { title: 'Tipo armado', key: 'TARMADO', align: 'start', sortable: false },
                { title: 'Nombre Cliente', key: 'IDECLI', align: 'start', sortable: false },
                { title: 'RUT Cliente', key: 'RUTCLI', align: 'start', sortable: false },
                { title: 'Primer recibo', key: 'FECHA_I', align: 'start', sortable: false },
                { title: 'Último recibo', key: 'FECHA_U', align: 'start', sortable: false },
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
            cantidadRecibida: null,
            idLugarArmado: null,
            numreq: '',
            codite: '',
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

                await axios.get(`/armadosaldo/paginado`, {
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
            const usuario = JSON.parse(localStorage.getItem('user'));
            let k = this.editedItem;
            let armado = {
                TARMADO: parseInt(k.TARMADO),
                CODREQ: k.CODREQ,
                GTARMADO: "Venta",
                IDLUGARARMADO: String(this.filtroLugar),
                LUGARDEARMADO: this.lugares.find(l => l.id === this.filtroLugar).nombre,
                CENTRO_BOD: k.CENTRO_BOD,
                CIUDADES: this.lugares.find(l => l.id === this.filtroLugar).ciudad,
                REGION: String(this.lugares.find(l => l.id === this.filtroLugar).region),
                ZONA: this.lugares.find(l => l.id === this.filtroLugar).zona.nombre,
                OC: k.OC,
                FACTURA_JDE: k.FACTURA_JDE,
                NUMREQ: k.NUMREQ,
                CODITE: k.CODITE,
                GUIA_CSF: k.GUIA_CSF,
                TGUIA: k.TGUIA,
                IDECLI: k.IDECLI,
                RUTCLI: k.RUTCLI,
                FECHA_OPERACION: new Date().toISOString().split('T')[0],
                TIPO_OPERACION: this.tipo === 'Positivo' ? 'C_AJUS_POSITIVA' : 'C_AJUS_NEGATIVA',
                CAN_X_ARMAR: this.tipo === 'Positivo' ? parseInt(this.cantidadRecibida) : parseInt(this.cantidadRecibida) * (-1),
                USUARIO_PRESTADOR: usuario.correo,
                PRESTADOR: this.prestadores.find(p => p.id === this.filtroPrestador).nombre,
                FECHA_HRS_OPERACION: new Date(),
                TARMADO_GLOSA: "Precio incluye armado Cj. (Arma CSF)",
                PERIODO: k.PERIODO,
                TIPO: k.TIPO,
                PRESTADORID: parseInt(k.PRESTADORID),
            };
            const armadokardex = {
                armado: armado,
                CANSOL: k.CANSOL,
                CANENT: k.CANENT,
                CANTOT_GUIA: k.CANTOT_GUIA,
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
                    if (this.tipo === 'Positivo') {
                        this.editedItem.CAN_X_ARMAR = parseInt(this.editedItem.CAN_X_ARMAR) + parseInt(this.cantidadRecibida);
                        this.editedItem.X_RECIBIR = parseInt(this.editedItem.X_RECIBIR) - parseInt(this.cantidadRecibida);
                    }
                    else {
                        this.editedItem.CAN_X_ARMAR = parseInt(this.editedItem.CAN_X_ARMAR) - parseInt(this.cantidadRecibida);
                        this.editedItem.X_RECIBIR = parseInt(this.editedItem.X_RECIBIR) + parseInt(this.cantidadRecibida);
                    }
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem);
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
            this.dialogRecibir = true;
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        },
    },
};
</script>
