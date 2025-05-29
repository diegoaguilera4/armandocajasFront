<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Temporadas por página"
        loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Temporadas<v-icon class="mx-2">mdi-calendar-clock</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-calendar-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nueva temporada
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-calendar-clock"
                                            v-model="editedItem.nombre" label="Nombre"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-locale-provider locale="es">
                                            <v-date-input v-model="editedItem.inicio" label="Fecha de inicio"
                                                prepend-icon="" append-inner-icon="$calendar" variant="solo-filled"
                                                cancel-text="cancelar" ok-text="seleccionar"></v-date-input>
                                        </v-locale-provider>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-locale-provider locale="es">
                                            <v-date-input v-model="editedItem.fin" label="Fecha de fin" prepend-icon=""
                                                append-inner-icon="$calendar" variant="solo-filled"
                                                cancel-text="cancelar" ok-text="seleccionar"></v-date-input>
                                        </v-locale-provider>
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
                                ¿Estás seguro que deseas eliminar esta temporada?
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
        <template v-slot:[`item.inicio`]="{ item }">
            <span>{{ formatearFecha(item.inicio) }}</span>
        </template>
        <template v-slot:[`item.fin`]="{ item }">
            <span>{{ formatearFecha(item.fin) }}</span>
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
import { ref } from 'vue';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Inicio', key: 'inicio', align: 'start', sortable: false },
            { title: 'Fin', key: 'fin', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nombre: '',
            inicio: ref(new Date()),
            fin: ref(new Date()),
            fechaInicio: '',
            fechaFin: '',
        },
        defaultItem: {
            nombre: '',
            inicio: ref(new Date()),
            fin: ref(new Date()),
            fechaInicio: '',
            fechaFin: '',
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
            return this.editedIndex === -1 ? 'Nueva temporada' : 'Editar temporada'
        },
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
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
                await axios.get(`/temporadas/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.temporadas;
                    this.serverItems.forEach(temp => {
                        temp.inicio = new Date(temp.inicio);
                        temp.fin = new Date(temp.fin);
                    });
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
            await this.eliminarTemporada();
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
            //validar folio aqui
            if (this.editedIndex > -1) {
                await this.actualizarTemporada();
            } else {
                await this.nuevaTemporada();
            }

        },
        verificarFechas() {
            if (this.editedItem.inicio > this.editedItem.fin) {
                this.$notify({
                    text: 'La fecha de inicio no puede ser mayor a la fecha de fin',
                    type: 'fallo'
                });
                return false;
            }
            return true;
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
        async nuevaTemporada() {
            try {
                if (!this.verificarFechas()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const nuevaTemporada = {
                    nombre: this.editedItem.nombre,
                    inicio: this.editedItem.inicio,
                    fin: this.editedItem.fin,
                }
                //setear inicio en las 00:00:00 y fin en las 23:59:59
                nuevaTemporada.inicio.setHours(0, 0, 0, 0);
                nuevaTemporada.fin.setHours(23, 59, 59, 999);
                await axios.post(`/temporadas`, nuevaTemporada, {
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
                        this.editedItem.id = response.data.id;
                        this.editedItem.fechaInicio = response.data.fechaInicio;
                        this.editedItem.fechaFin = response.data.fechaFin;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Temporada ${response.data.id} creada correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }

                }).catch((error) => {
                    console.error('Error al crear nueva temporada', error);
                    this.$notify({
                        text: 'Error al crear la temporada',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nueva temporada', error);
            }
        },
        async eliminarTemporada() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/temporadas/${this.editedItem.id}`, {
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
                        text: `Temporada ${response.data.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;
                }).catch((error) => {
                    console.error('Error al eliminar una temporada', error);
                    this.$notify({
                        text: 'Error al eliminar la temporada',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar una temporada', error);
            }
        },
        async actualizarTemporada() {
            try {
                if (!this.verificarFechas()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const tempAct = Object.assign({}, this.editedItem);
                delete tempAct.id;
                delete tempAct.fechaInicio;
                delete tempAct.fechaFin;
                // setear inicio en las 00:00:00 y fin en las 23:59:59
                tempAct.inicio.setHours(0, 0, 0, 0);
                tempAct.fin.setHours(23, 59, 59, 999);

                await axios.patch(`/temporadas/${this.editedItem.id}`, tempAct, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {

                    if (response.data.status !== 404) {
                        this.editedItem.fechaInicio = response.data.fechaInicio;
                        this.editedItem.fechaFin = response.data.fechaFin;
                        this.$notify({
                            text: `Temporada ${this.editedItem.id} actualizado correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }
                    else {
                        this.$notify({
                            text: `Temporada ${this.editedItem.id} no encontrado`,
                            type: 'fallo'
                        });
                    }

                    Object.assign(this.serverItems[this.editedIndex], this.editedItem)
                }).catch((error) => {
                    console.error('Error al actualizar la temporada', error);
                    this.$notify({
                        text: 'Error al actualizar la temporada',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar la temporada', error);
            }
        },
    }
};
</script>

<style></style>