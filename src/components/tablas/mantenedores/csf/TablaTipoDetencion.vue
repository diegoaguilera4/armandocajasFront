<template>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading" :search="search"
        item-value="_id" @update:options="loadItems" items-per-page-text="Tipo de detenciones por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Tipo detenciones<v-icon class="mx-2">mdi-timer-off</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo tipo detención
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
                                        <v-textarea prepend-inner-icon="mdi-text" v-model="editedItem.descripcion"
                                            label="Descripcion" :rules="[rules.required]"></v-textarea>
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
                                ¿Estás seguro que deseas eliminar este tipo de detención?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.descripcion }}
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
            { title: 'Descripción', key: 'descripcion', align: 'start', sortable: false },

        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        search: '',
        editedItem: {
            descripcion: '',
        },
        defaultItem: {
            descripcion: '',
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo tipo de detención' : 'Editar tipo de detención'
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
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/tipoDetencion/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.tipoDetenciones;
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
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            await this.eliminarDetencion();
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
        async save() {
            if (this.editedIndex > -1) {
                await this.actualizarDetencion();
            } else {
                await this.nuevaDetencion();
            }

        },
        verificar() {
            if (this.editedItem.descripcion === '') {
                this.$notify({
                    text: 'Debe ingresar una descripción',
                    type: 'fallo'
                });
                return false;
            }
            return true;
        },
        async nuevaDetencion() {
            try {
                if (!this.verificar()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/tipoDetencion`, this.editedItem, {
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
                    else {
                        this.editedItem = response.data;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Tipo detención ${response.data.id} creada correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }

                }).catch((error) => {
                    console.error('Error al crear nuevo tipo detención', error);
                    this.$notify({
                        text: 'Error al crear nuevo tipo detenciónn',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo tipo detencióno', error);
            }
        },
        async eliminarDetencion() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/tipoDetencion/${this.editedItem.id}`, {
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
                        text: `Tipo de detención ${response.data.id} eliminada correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;

                }).catch((error) => {
                    console.error('Error al eliminar tipo de detención', error);
                    this.$notify({
                        text: 'Error al eliminar tipo de detención',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar tipo de detención', error);
            }
        },
        async actualizarDetencion() {
            try {
                if (!this.verificar()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let detencion = Object.assign({}, this.editedItem);
                delete detencion.id;
                await axios.patch(`/tipoDetencion/${this.editedItem.id}`, detencion, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {

                    if (response.data.status !== 404) {
                        this.editedItem = response.data;
                        this.$notify({
                            text: `Tipo de detención ${this.editedItem.id} actualizada correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }
                    else {
                        this.$notify({
                            text: `Tipo de detención ${this.editedItem.id} no encontrado`,
                            type: 'fallo'
                        });
                    }

                    Object.assign(this.serverItems[this.editedIndex], this.editedItem)
                }).catch((error) => {
                    console.error('Error al actualizar tipo de detención', error);
                    this.$notify({
                        text: 'Error al actualizar tipo de detención',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar tipo de detención', error);
            }
        },
    }
};
</script>

<style></style>