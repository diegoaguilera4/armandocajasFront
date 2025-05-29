<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="idLugarArmado" label="Filtrar por lugar" chips
                    clearable :items="lugares" item-title="nombre" item-value="id">
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
    <v-data-table-server v-if="idLugarArmado" v-model:items-per-page="itemsPerPage" :mobile="smAndDown"
        :headers="headers" :items="serverItems" :items-length="totalItems" :loading="loading" :search="search"
        item-value="_id" @update:options="loadItems" :items-per-page-options="[10, 25, 50, totalItems]"
        items-per-page-text="Registros por página" page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">

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
            <v-tooltip v-if="item.CAN_X_ARMAR > 0" text="Armar cajas" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="armarCajas(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
    </v-data-table-server>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            itemsPerPage: 10,
            headersBase: [
                { title: 'Acciones', key: 'actions', sortable: false },
                { title: 'Cantidad por armar', key: 'CAN_X_ARMAR', align: 'start', sortable: false },
                { title: 'Cantidad solicitada', key: 'CANSOL', align: 'start', sortable: false },
                //{ title: 'Cantidad despachada', key: 'CAN_DESPAC', align: 'start', sortable: false },
                //{ title: 'Cantidad entregada', key: 'CANENT', align: 'start', sortable: false },
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
            numreq: '',
            codite: '',
            dialogRecibir: false,
            editedItem: {},
            editedIndex: -1,
            idLugarArmado: null,
            tipo: '',
            tieneFolios: false,
            smAndDown: window.innerWidth < 960,
            lugares: [],
            user: {},
        };
    },
    computed: {
        headers() {
            if (this.tipo === 'anticipado') {
                const headers = [...this.headersBase];
                const nvIndex = headers.findIndex(header => header.key === 'NUMREQ');
                const guiaHeader = { title: 'Guía', key: 'GUIA_CSF', align: 'start', sortable: false };

                if (nvIndex !== -1) {
                    headers.splice(nvIndex, 0, guiaHeader);
                } else {
                    headers.push(guiaHeader);
                }

                return headers;
            }
            return this.headersBase;
        }
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
        idLugarArmado() {
            this.search = String(Date.now());
        },
    },
    async created() {
        // Se obtiene el id del lugar de armado del usuario
        this.user = JSON.parse(localStorage.getItem('user'));
        await this.obtenerLugares();
        await this.verificarFolios();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let rutBusqueda = this.rutCliente;
                let ruta = this.$route.path;
                if (ruta === '/armarAnt') {
                    this.tipo = 'ANT';
                } else if (ruta === '/armarNv') {
                    this.tipo = 'NV';
                    rutBusqueda = this.rutCliente.replace(/-/g, '');
                    //} else if (ruta === '/armarStockCsf') {
                    //  this.tipo = 'stock';
                } else if (ruta === '/armarExterno') {
                    this.tipo = 'EXT';
                }
                await axios.get(`/armadosaldo/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        rut: rutBusqueda,
                        nombre: this.nombreCliente,
                        tipo: this.tipo,
                        idLugar: this.idLugarArmado,
                        numreq: this.numreq,
                        codite: this.codite
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
        async obtenerLugares() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.get(`/lugarArmados/prestador`, {
                params: {
                    prestadorId: user.prestador[0].prestadorId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                this.lugares = response.data;
            }).catch(error => {
                console.error('Error al cargar los lugares', error);
            });
        },
        close() {
            this.dialogRecibir = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        armarCajas(item) {
            if (!this.tieneFolios) {
                this.$notify({
                    text: 'No tiene folios disponibles',
                    type: 'fallo'
                });
                return;
            }
            localStorage.setItem('item', JSON.stringify(item));
            if (this.$route.path === '/armarAnt') {
                localStorage.setItem('tipo', 'SE_ARMO_ANT');
            } else if (this.$route.path === '/armarNv') {
                localStorage.setItem('tipo', 'SE_ARMO_NV');
            } else if (this.$route.path === '/armarStockCsf') {
                localStorage.setItem('tipo', 'SE_ARMO_STOCK_CSF');
            } else if (this.$route.path === '/armarExterno') {
                localStorage.setItem('tipo', 'SE_ARMO_SERV');
            }
            // Guardar en local storage el lugar de armado
            const lugar = this.lugares.find(lugar => lugar.id === this.idLugarArmado);
            localStorage.setItem('lugarArmado', JSON.stringify(lugar));
            this.$router.push('/formularioArmado');
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
        async verificarFolios() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            const usuario = JSON.parse(localStorage.getItem('user'));
            const prestador = usuario.prestador[0].prestadorId;
            await axios.get(`/prestadores/folios/${prestador}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(() => {
                this.tieneFolios = true;
            }).catch(() => {
                this.tieneFolios = false;
            });
        },
    },
};
</script>
