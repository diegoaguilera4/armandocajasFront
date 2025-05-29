<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-row style="margin-top: 5px; margin-left: 5px;">
        <v-col cols="12" md="3" sm="5">
            <v-select prepend-inner-icon="mdi-calendar-clock" v-model="filtroTemporada" label="Temporada" chips
                :items="temporadas" item-title="nombre" item-value="id">
            </v-select>
        </v-col>
    </v-row>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="servicios"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Servicios por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:[`item.precio`]="{ item }">
            <span>${{ item.precio }} CLP</span>
        </template>
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Precio servicios de {{
                    this.$route.params.nombre }}<v-icon class="mx-2">mdi-hammer-screwdriver</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo servicio
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="12" sm="12">
                                        {{editedItem.servicio.codigo}} -  {{ editedItem.servicio.descripcion }}
                                    </v-col>
                                    <v-col v-if="editedIndex === -1" cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-hammer-screwdriver"
                                            v-model="editedItem.servicioId" :items="disponibles"
                                            item-title="descripcion" label="Seleccione servicio" item-value="id">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'Código: ' + item.raw.codigo"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field v-model="temporadaNombre" prepend-inner-icon="mdi-calendar-clock"
                                            label="Temporada" readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input v-model="editedItem.precio1" :reverse="false"
                                            controlVariant="split" label="Rango precio 1" :hideInput="false" inset
                                            variant="solo-filled" :min="1"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input v-model="editedItem.precio2" :reverse="false"
                                            controlVariant="split" label="Rango precio 2" :hideInput="false" inset
                                            variant="solo-filled" :min="1"></v-number-input>
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
                                ¿Estás seguro que deseas eliminar este servicio?
                            </span>
                            <span class="text-h6 text-wrap">{{editedItem.servicio.codigo}} -  {{ editedItem.servicio.descripcion }} </span>
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
        dialog: false,
        dialogDelete: false,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            {
                title: 'Código',
                align: 'start',
                sortable: false,
                key: 'servicio.codigo',
            },
            {
                title: 'Servicio',
                align: 'start',
                sortable: false,
                key: 'servicio.descripcion',
            },
            {
                title: 'Temporada',
                align: 'start',
                sortable: false,
                key: 'temporada.nombre',
            },
            {
                title: 'Precio rango 1',
                align: 'start',
                sortable: false,
                key: 'precio1',
            },
            {
                title: 'Precio rango 2',
                align: 'start',
                sortable: false,
                key: 'precio2',
            },
        ],
        servicios: [],
        disponibles: [],
        editedIndex: -1,
        editedItem: {
            servicioId: null,
            precio1: null,
            precio2: null,
            servicio: {
                codigo: null,
                descripcion: null,
            },
        },
        defaultItem: {
            servicioId: null,
            precio1: null,
            precio2: null,
            servicio: {
                codigo: null,
                descripcion: null,
            },
        },
        items: [
            {
                title: 'Lugares de armado',
                disabled: false,
                href: '/lugaresArmado',
            },
            {
                title: `Precio servicios`,
                disabled: true,
                href: '',
            },
        ],
        totalItems: 0,
        search: '',
        loading: true,
        itemsPerPage: 10,
        temporadas: [],
        filtroTemporada: null,
        temporadaNombre: null,
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo servicio' : 'Editar servicio'
        },

    },

    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
        async filtroTemporada(val) {
            this.search = String(new Date());
            this.temporadaNombre = this.temporadas.find(temporada => temporada.id === val).nombre;
            await this.obtenerDisponiblesTemporada();
        }
    },

    async created() {
        await this.obtenerTemporadas()
        await this.obtenerDisponiblesTemporada()
    },

    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/servicioLugarArmado/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        lugarArmadoId: this.$route.params.id,
                        temporadaId: this.filtroTemporada
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.servicios = response.data.serviciosPrecios;
                    this.totalItems = response.data.total;

                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al obtener los servicios',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al obtener los servicios',
                    type: 'fallo'
                });
            } finally {
                this.loading = false;
            }
        },
        async obtenerTemporadas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/temporadas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.temporadas = response.data;
                    this.filtroTemporada = this.temporadas[0].id;
                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al obtener las temporadas',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al obtener las temporadas',
                    type: 'fallo'
                });
            }
        },
        async obtenerDisponiblesTemporada() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/servicioLugarArmado/disponibles/${this.$route.params.id}/${this.filtroTemporada}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.disponibles = response.data;
                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al obtener los servicios',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al obtener los servicios disponibles',
                    type: 'fallo'
                });
            }
        },
        editItem(item) {
            this.editedIndex = this.servicios.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem(item) {
            this.editedIndex = this.servicios.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },

        async deleteItemConfirm() {
            await this.eliminarServicio()
            await this.obtenerDisponiblesTemporada()
            this.closeDelete()
        },

        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeDelete() {
            this.dialogDelete = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        async agregarServicio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const servicioPrecioNuevo = {
                    servicioId: parseInt(this.editedItem.servicioId),
                    lugarArmadoId: parseInt(this.$route.params.id),
                    precio1: parseInt(this.editedItem.precio1),
                    precio2: parseInt(this.editedItem.precio2),
                    temporadaId: parseInt(this.filtroTemporada)
                }
                await axios.post(`/servicioLugarArmado`, servicioPrecioNuevo, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    if (this.servicios.length < this.itemsPerPage) {
                        this.servicios.push(response.data);
                    }
                    this.totalItems += 1;
                    this.obtenerDisponiblesTemporada();
                    this.close();
                    this.$notify({
                        text: 'Servicio agregado correctamente',
                        type: 'exito'
                    });
                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al agregar el servicio',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error)
                this.$notify({
                    text: 'Error al agregar el servicio',
                    type: 'fallo'
                });
            }
        },
        async eliminarServicio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/servicioLugarArmado/${this.editedItem.servicioId}/${this.$route.params.id}/${this.filtroTemporada}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.servicios.splice(this.editedIndex, 1)
                    this.totalItems -= 1;
                    this.$notify({
                        text: `Servicio ${response.data.servicioId} eliminado correctamente`,
                        type: 'exito'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al eliminar el servicio',
                    type: 'fallo'
                });
            }
        },
        async actualizarServicio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const servicioActualizado = {
                    servicioId: parseInt(this.editedItem.servicioId),
                    lugarArmadoId: parseInt(this.$route.params.id),
                    precio1: parseInt(this.editedItem.precio1),
                    precio2: parseInt(this.editedItem.precio2)
                }
                await axios.patch(`/servicioLugarArmado/${this.editedItem.servicioId}/${this.$route.params.id}/${this.filtroTemporada}`, servicioActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    Object.assign(this.servicios[this.editedIndex], response.data)
                    this.close();
                    this.$notify({
                        text: 'Servicio actualizado correctamente',
                        type: 'exito'
                    });
                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al actualizado el servicio',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error)
                this.$notify({
                    text: 'Error al actualizado el servicio',
                    type: 'fallo'
                });
            }
        },
        async save() {
            //validar folio aqui
            if (this.editedIndex > -1) {
                await this.actualizarServicio();
            } else {
                await this.agregarServicio();
            }

        },
    },
}
</script>