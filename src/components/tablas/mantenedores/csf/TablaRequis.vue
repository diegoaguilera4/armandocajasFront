<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" lg="2" md="4" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nv" label="NV" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="4" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="codigo" label="Código" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="4" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="rutCliente" label="RUT cliente" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="4" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombreCliente" label="Nombre cliente"
                    hide-details clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="4" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="tarmado" label="TARMADO" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Registros por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Requis<v-icon class="mx-2">mdi-order-bool-ascending</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">Editar TARMADO</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="4" sm="4">
                                        <v-text-field v-model="editedItem.NUMREQ" label="NV" readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4" sm="4">
                                        <v-text-field v-model="editedItem.CODITE" label="Código"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4" sm="4">
                                        <v-text-field v-model="editedItem.TARMADO" label="TARMADO"
                                            type="number"></v-text-field>
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
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:[`item.FECEMI`]="{ item }">
            <span>{{ formatearFecha(item.FECEMI) }}</span>
        </template>
        <template v-slot:[`item.FECCUM`]="{ item }">
            <span>{{ formatearFecha(item.FECCUM) }}</span>
        </template>
        <template v-slot:[`item.RUTCLI`]="{ item }">
            <span>{{ formatearRut(item.RUTCLI) }}</span>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'NV', key: 'NUMREQ', align: 'start', sortable: false },
            { title: 'Código', key: 'CODITE', align: 'start', sortable: false },
            { title: 'TARMADO', key: 'TARMADO', align: 'start', sortable: false },
            { title: 'RUT Cliente', key: 'RUTCLI', align: 'start', sortable: false },
            { title: 'Nombre cliente', key: 'IDECLI', align: 'start', sortable: false },
            { title: 'Fecha emitida', key: 'FECEMI', align: 'start', sortable: false },
            { title: 'Fecha de cumplimiento', key: 'FECCUM', align: 'start', sortable: false },
            { title: 'Cantidad solicitada', key: 'CANSOL', align: 'start', sortable: false },
            { title: 'Cantidad entregada', key: 'CANENT', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        search: '',
        editedItem: {
        },
        defaultItem: {
        },
        editedIndex: -1,
        dialog: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        nombreCliente: '',
        rutCliente: '',
        nv: '',
        codigo: '',
        tarmado: '',
    }),
    computed: {
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
        nombreCliente() {
            this.search = String(Date.now());
        },
        rutCliente() {
            this.search = String(Date.now());
        },
        nv() {
            this.search = String(Date.now());
        },
        codigo() {
            this.search = String(Date.now());
        },
        tarmado() {
            this.search = String(Date.now());
        },
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/database/obtenerRequis2`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombreCliente,
                        rut: this.rutCliente,
                        numreq: this.nv,
                        codite: this.codigo,
                        tarmado: this.tarmado
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.tabla;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        async save() {
            await this.actualizarTarmado();
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
            });
        },
        formatearRut(rut) {
            //agregar - antes del ultimo numero
            return (rut.slice(0, -1) + '-' + rut.slice(-1)).replace(/^0+/, '');
        },
        async actualizarTarmado() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }

                await axios.put(`/database/actualizarTarmado/${this.editedItem.NUMREQ}/${this.editedItem.CODITE}/${this.editedItem.TARMADO}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.search = String(Date.now());
                    this.$notify({
                        text: `${this.editedItem.NUMREQ} - ${this.editedItem.CODITE} actualizado correctamente`,
                        type: 'exito'
                    });
                    this.close();
                }).catch((error) => {
                    console.error('Error al actualizar TARMADO', error);
                    this.$notify({
                        text: 'Error al actualizar TARMADO',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar TARMADO', error);
                this.$notify({
                    text: 'Error al actualizar TARMADO',
                    type: 'fallo'
                });
            }
        }
    }
};
</script>

<style></style>