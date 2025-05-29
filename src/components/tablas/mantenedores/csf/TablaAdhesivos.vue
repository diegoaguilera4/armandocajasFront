<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroCodigo" label="Código" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroDescripcion" label="Descripción"
                    hide-details clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        :items-per-page-options="[10, 25, 50, totalItems]" items-per-page-text="Adhesivos por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Adhesivos<v-icon class="mx-2">mdi-water</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="green"
                            @click="exportarExcel()">Exportar</v-btn>
                        <v-btn append-icon="mdi-water-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px; margin-left: 10px;" dark v-bind="props">
                            Nuevo adhesivo
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-barcode" v-model="editedItem.codigo"
                                            label="Código" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-text" v-model="editedItem.descripcion"
                                            label="Descripción" :rules="[rules.required]"></v-text-field>
                                    </v-col>

                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-text" v-model="editedItem.descripcion2"
                                            label="Descripción 2"></v-text-field>
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
                <v-dialog v-model="dialogDelete" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            <span class="text-h6 text-wrap">
                                ¿Estás seguro que deseas eliminar este adhesivo?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.codigo }} - {{ editedItem.descripcion }}
                            </span>
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeDelete">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="deleteItemConfirm">Si, eliminar</v-btn>
                            <v-spacer></v-spacer>
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
            <v-tooltip text="Eliminar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="deleteItem(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-tooltip>
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
            { title: 'Código', key: 'codigo', align: 'start', sortable: false },
            { title: 'Descripción', key: 'descripcion', align: 'start', sortable: false },
            { title: 'Descripción 2', key: 'descripcion2', align: 'start', sortable: false },

        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            codigo: '',
            descripcion: '',
            descripcion2: '',
        },
        defaultItem: {
            codigo: '',
            descripcion: '',
            descripcion2: '',
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        filtroCodigo: null,
        filtroDescripcion: null
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo adhesivo' : 'Editar adhesivo';
        },
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.close();
            }
        },
        dialogDelete(val) {
            if (!val) {
                this.closeDelete();
            }
        },
        filtroCodigo() {
            this.search = String(Date.now());
        },
        filtroDescripcion() {
            this.search = String(Date.now());
        }
    },
    created() {
    },
    methods: {
        async exportarExcel() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/adhesivos/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            codigo: this.filtroCodigo,
                            descripcion: this.filtroDescripcion
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'adhesivos.xlsx');
                        document.body.appendChild(link);
                        link.click();
                    }
                    ).catch((error) => {
                        console.error('Error al exportar a excel', error);
                    });
            } catch (error) {
                console.error('Error al exportar a excel', error);
            }
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivos/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        codigo: this.filtroCodigo,
                        descripcion: this.filtroDescripcion
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.adhesivos;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar adhesivos', error);
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        async deleteItemConfirm() {
            await this.eliminarAdhesivo();
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        async save() {
            if (this.editedIndex > -1) {
                await this.actualizarAdhesivo();
            } else {
                await this.nuevoAdhesivo();
            }
        },
        async nuevoAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/adhesivos`, this.editedItem, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 404) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    } else {
                        this.editedItem = response.data;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Adhesivo ${response.data.codigo} creado correctamente`,
                            type: 'exito'
                        });
                        this.close();
                    }
                }).catch((error) => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo adhesivo', error);
            }
        },
        async eliminarAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/adhesivos/${this.editedItem.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 404) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    }
                    this.$notify({
                        text: `Adhesivo ${response.data.codigo} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1);
                    this.totalItems -= 1;
                }).catch((error) => {
                    console.error('Error al eliminar el adhesivo', error);
                    this.$notify({
                        text: 'Error al eliminar el adhesivo',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar el adhesivo', error);
            }
        },
        async actualizarAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const adhesivo = {
                    descripcion: this.editedItem.descripcion,
                    descripcion2: this.editedItem.descripcion2,
                }
                await axios.patch(`/adhesivos/${this.editedItem.id}`, adhesivo, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.$notify({
                            text: `Adhesivo ${this.editedItem.codigo} actualizado correctamente`,
                            type: 'exito'
                        });
                        Object.assign(this.serverItems[this.editedIndex], this.editedItem);
                        this.close();
                    } else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                }).catch((error) => {
                    console.error('Error al actualizar el adhesivo', error);
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el adhesivo', error);
            }
        },
    }
};
</script>

<style></style>