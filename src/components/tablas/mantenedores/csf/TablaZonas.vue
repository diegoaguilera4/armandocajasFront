<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Zonas por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:[`item.regiones`]="{ item }">
            <div>
                <span v-for="(region, index) in item.regiones" :key="index">
                    {{ region }}<span v-if="index < item.regiones.length - 1">, </span>
                </span>
            </div>
        </template>
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Zonas<v-icon class="mx-2">mdi-map</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-map-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nueva zona
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
                                        <v-text-field prepend-inner-icon="mdi-map" v-model="editedItem.nombre"
                                            label="Nombre" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-select prepend-inner-icon="mdi-map-marker-multiple"
                                            v-model="regionesSeleccionadas" label="Seleccione regiones" chips multiple
                                            :items="regiones" item-title="nombre">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'N°:' + item.raw.numero + ' (' + item.raw.numeroRomano + ')'"></v-list-item>
                                            </template>
                                        </v-select>
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
                                ¿Estás seguro que deseas eliminar esta zona?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.nombre }}
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
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Regiones', key: 'regiones', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nombre: '',
            regiones: [],
        },
        defaultItem: {
            nombre: '',
            regiones: [],
        },
        regionesSeleccionadas: [],
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        regiones: [],
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nueva zona' : 'Editar zona'
        },
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
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
    },
    async created() {
        await this.obtenerRegiones();
    },
    methods: {
        async obtenerRegiones() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/regiones`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.regiones = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las regiones', error);
                });
            } catch (error) {
                console.error('Error al cargar las regiones', error);
            }
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/zonas/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.zonas.map(zona => {
                        return {
                            ...zona,
                        };
                    });
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar las zonas', error);
                });
            } catch (error) {
                console.error('Error al cargar las zonas', error);
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.regionesSeleccionadas = item.regiones;
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
            await this.eliminarZona();
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
                this.regionesSeleccionadas = []; // Restablecer regiones seleccionadas
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
            if (!this.verificarZona()) {
                return;
            }
            if (this.editedIndex > -1) {
                await this.actualizarZona();
            } else {
                await this.nuevaZona();
            }
        },
        verificarZona() {
            //Verificar que se haya seleccionado al menos una región
            if (this.regionesSeleccionadas.length === 0) {
                this.$notify({
                    text: 'Debe seleccionar al menos una región',
                    type: 'fallo'
                });
                return false;
            }
            return true;
        },
        async nuevaZona() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const zona = {
                    nombre: this.editedItem.nombre,
                };
                const regionesNum = this.regiones.filter(region => this.regionesSeleccionadas.includes(region.nombre))
                    .map(region => region.numero);

                await axios.post(`/zonas`, { ...zona, regiones: regionesNum }, {
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
                        this.editedItem.id = response.data.id;
                        this.editedItem.regiones = response.data.regiones;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Zona ${response.data.id} creada correctamente`,
                            type: 'exito'
                        });
                        this.regionesSeleccionadas = [];
                        this.close();
                    }
                }).catch((error) => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nueva zona', error);
            }
        },
        async eliminarZona() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/zonas/${this.editedItem.id}`, {
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
                        text: `Zona ${response.data.id} eliminada correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1);
                    this.totalItems -= 1;
                    this.regionesSeleccionadas = [];
                }).catch((error) => {
                    console.error('Error al eliminar una zona', error);
                    this.$notify({
                        text: 'Error al eliminar la zona',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar una zona', error);
            }
        },
        async actualizarZona() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const zonaAct = Object.assign({}, this.editedItem);
                delete zonaAct.id;
                zonaAct.regiones = this.regiones.filter(region => this.regionesSeleccionadas.includes(region.nombre))
                    .map(region => region.numero);
                await axios.patch(`/zonas/${this.editedItem.id}`, zonaAct, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.editedItem.regiones = response.data.regiones;
                        this.$notify({
                            text: `Zona ${this.editedItem.id} actualizada correctamente`,
                            type: 'exito'
                        });
                        this.close();
                    } else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem);
                }).catch((error) => {
                    console.error('Error al actualizar la zona', error);
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar la zona', error);
            }
        },
    }
};
</script>

<style></style>