<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table :headers="headers" :items="servicios" items-per-page-text="Servicios por página"
        page-text="{0}-{1} de {2}">
        <template v-slot:[`item.precio`]="{ item }">
            <span>${{ item.precio }} CLP</span>
        </template>
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Servicios de {{
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
                                        {{ editedItem.servicio.descripcion }}
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
                            <span class="text-h6 text-wrap">{{ editedItem.servicio.codigo }} - {{ editedItem.servicio.descripcion }}</span>
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
    </v-data-table>
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
                title: 'Servicio ID',
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
        ],
        servicios: [],
        disponibles: [],
        editedIndex: -1,
        editedItem: {
            servicioId: null,
            servicio: {
                id: null,
                codigo: null,
                descripcion: null,
            }
        },
        defaultItem: {
            servicioId: null,
            servicio: {
                id: null,
                codigo: null,
                descripcion: null,
            }
        },
        items: [
            {
                title: 'Prestadores',
                disabled: false,
                href: '/prestadores',
            },
            {
                title: `Servicios`,
                disabled: true,
                href: '',
            },
        ]
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
    },

    async created() {
        await this.obtenerServicios()
        await this.obtenerDisponibles()
    },

    methods: {
        async obtenerServicios() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/servicioPrestador/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.servicios = response.data;
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
            }
        },
        async obtenerDisponibles() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/servicioPrestador/disponibles/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.disponibles = response.data;
                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al obtener los servicios disponibles',
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
            await this.obtenerDisponibles()
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
                const nuevoServicio = {
                    servicioId: this.editedItem.servicioId,
                    prestadorId: parseInt(this.$route.params.id)
                };
                await axios.post(`/servicioPrestador`, nuevoServicio, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.servicios.push(response.data);
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
                await axios.delete(`/servicioPrestador/${this.editedItem.servicioId}/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    if (response.data.status === 404) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return
                    }
                    this.servicios.splice(this.editedIndex, 1)
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
        async save() {
            await this.agregarServicio()
            await this.obtenerDisponibles()
            this.close()
        },
    },
}
</script>