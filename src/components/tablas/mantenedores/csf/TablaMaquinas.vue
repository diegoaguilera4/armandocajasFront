<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroNmaquina" label="N° máquina" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroNombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroMarca" label="Marca" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select v-model="filtroEstado" clearable chips prepend-inner-icon="mdi-magnify" label="Estado"
                    :items="['En uso', 'En mantención', 'Disponible']" multiple></v-select>
            </v-col>
        </v-row>
    </v-container>

    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        :items-per-page-options="[10, 25, 50, totalItems]" items-per-page-text="Máquinas por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Máquinas<v-icon class="mx-2">mdi-engine</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="green"
                            @click="exportarExcel()">Exportar</v-btn>
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px; margin-left: 10px;" dark v-bind="props">
                            Nueva máquina
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
                                        <v-text-field v-model="editedItem.nmaquina" label="N° máquina"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.nombre" label="Nombre"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.marca" label="Marca"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.modelo" label="Modelo"
                                            :rules="[rules.required]"></v-text-field>
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
                <v-dialog v-model="dialogTraslado" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">Trasladar máquina</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.nmaquina" label="N° máquina"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.nombre" label="Nombre"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.marca" label="Marca" readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.modelo" label="Modelo"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6" v-if="editedItem.estado !== 'En uso'">
                                        <v-text-field v-model="editedItem.estado" label="Lugar" readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6" v-if="editedItem.estado === 'En uso'">
                                        <v-text-field v-model="editedItem.nombreLugar" label="Lugar"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-select v-model="nuevoEstado" :items="estadosDisponibles" label="Destino"
                                            :rules="[rules.required]"></v-select>
                                    </v-col>
                                    <v-col v-if="nuevoEstado === 'Lugar de armado'" cols="12" md="6" sm="6">
                                        <v-select v-model="filtroPrestador" label="Prestador" :items="prestadores"
                                            :rules="[rules.required]" item-title="nombreCorto" item-value="id"
                                            @change="onPrestadorChange">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                                            </template>
                                        </v-select>
                                    </v-col>
                                    <v-col v-if="filtroPrestador && nuevoEstado === 'Lugar de armado'" cols="12" md="6"
                                        sm="6">
                                        <v-select v-model="filtroLugar" label="Lugar de armado" :items="lugares"
                                            item-title="nombre" item-value="id" :rules="[rules.required]">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="guiaDespacho" label="Guía de despacho"
                                            :rules="[rules.required]">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeTraslado">
                                Cancelar
                            </v-btn>
                            <v-btn color="primary" variant="elevated" @click="trasladarMaquina">
                                Guardar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            <span class="text-h6 text-wrap">
                                ¿Estás seguro que deseas eliminar esta máquina?
                            </span>
                            <!-- Mostrar n° máquina -->
                            <span class="text-h6 text-wrap">N° máquina: {{ editedItem.nmaquina }}</span>
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
        <template v-slot:[`item.estado`]="{ item }">
            <div v-if="item.estado === 'Bodega'">
                Disponible
            </div>
            <div v-else-if="item.estado === 'Taller'">
                En mantención
            </div>
            <div v-else>
                {{ item.estado }}
            </div>
        </template>
        <template v-slot:[`item.nombreLugar`]="{ item }">
            <div v-if="item.estado === 'Bodega'">
                Bodega
            </div>
            <div v-else-if="item.estado === 'Taller'">
                Taller
            </div>
            <div v-else>
                {{ item.nombreLugar }}
            </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Trasladar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#2196F3" @click="trasladar(item)">
                        mdi-truck-delivery
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
            { title: 'N° máquina', key: 'nmaquina', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Marca', key: 'marca', align: 'start', sortable: false },
            { title: 'Modelo', key: 'modelo', align: 'start', sortable: false },
            { title: 'Estado', key: 'estado', align: 'start', sortable: false },
            { title: 'Lugar', key: 'nombreLugar', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nmaquina: '',
            nombre: '',
            marca: '',
            modelo: '',
            estado: '',
        },
        defaultItem: {
            nmaquina: '',
            nombre: '',
            marca: '',
            modelo: '',
            estado: '',
        },
        estados: ['Bodega', 'Taller', 'Lugar de armado'],
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        dialogTraslado: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        filtroEstado: null,
        filtroNombre: null,
        filtroMarca: null,
        filtroNmaquina: null,
        guiaDespacho: '',
        nuevoEstado: '',
        prestadores: [],
        lugares: [],
        filtroPrestador: null,
        filtroLugar: null,
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nueva máquina' : 'Editar máquina';
        },
        estadosDisponibles() {
            return this.estados.filter(e => e !== this.editedItem.estado);
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
        dialogTraslado(val) {
            if (!val) {
                this.closeTraslado();
            }
        },
        filtroNombre() {
            this.search = String(Date.now());
        },
        filtroEstado() {
            this.search = String(Date.now());
        },
        filtroMarca() {
            this.search = String(Date.now());
        },
        filtroNmaquina() {
            this.search = String(Date.now());
        },
        filtroPrestador() {
            this.onPrestadorChange(this.filtroPrestador);
        },
    },
    async created() {
        await this.obtenerPrestadores();
    },
    methods: {
        async exportarExcel() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/maquina/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            nombre: this.filtroNombre,
                            marca: this.filtroMarca,
                            estado: this.filtroEstado
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'maquinas.xlsx');
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
                await axios.get(`/maquina/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.filtroNombre,
                        marca: this.filtroMarca,
                        estado: this.filtroEstado,
                        nmaquina: this.filtroNmaquina
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    //guardar nombreLugar en cada maquina para mostrar en tabla
                    response.data.maquinas.forEach(m => {
                        if (m.lugares.length > 0) {
                            m.nombreLugar = m.lugares[0].lugarArmado.nombre;
                        }
                    });
                    this.serverItems = response.data.maquinas;

                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar maquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar maquinas', error);
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },
        trasladar(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogTraslado = true;
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        async deleteItemConfirm() {
            await this.eliminarMaquina();
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.guiaDespacho = '';
            this.nuevoEstado = '';
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeTraslado() {
            this.dialogTraslado = false;
            this.guiaDespacho = '';
            this.nuevoEstado = '';
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.guiaDespacho = '';
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        async save() {
            if (this.editedIndex > -1) {
                await this.actualizarMaquina();
            } else {
                await this.nuevaMaquina();
            }
        },
        async nuevaMaquina() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                this.editedItem.estado = 'Bodega';
                await axios.post(`/maquina`, this.editedItem, {
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
                            text: `Máquina ${response.data.id} creada correctamente`,
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
                console.error('Error al crear nueva máquina', error);
            }
        },
        async eliminarMaquina() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/maquina/${this.editedItem.id}`, {
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
                        text: `Máquina ${response.data.id} eliminada correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1);
                    this.totalItems -= 1;
                }).catch((error) => {
                    console.error('Error al eliminar la máquina', error);
                    this.$notify({
                        text: 'Error al eliminar la máquina',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar la máquina', error);
            }
        },
        async trasladarMaquina() {
            if (this.guiaDespacho === '') {
                this.$notify({
                    text: 'Debe ingresar la guía de despacho',
                    type: 'fallo'
                });
                return;
            }
            if (this.nuevoEstado === '') {
                this.$notify({
                    text: 'Debe seleccionar el lugar',
                    type: 'fallo'
                });
                return;
            }
            if (this.nuevoEstado === 'Lugar de armado') {
                if (this.filtroPrestador === null) {
                    this.$notify({
                        text: 'Debe seleccionar un prestador',
                        type: 'fallo'
                    });
                    return;
                }
                if (this.filtroLugar === null) {
                    this.$notify({
                        text: 'Debe seleccionar un lugar de armado',
                        type: 'fallo'
                    });
                    return;
                }
                await this.trasladarDeLugar();
            }
            else {
                await this.actualizarMaquina();

            }
        },
        async trasladarDeLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/maquina/trasladarDeLugar/${this.editedItem.id}`, {
                    idLugar: this.filtroLugar,
                    guia: this.guiaDespacho
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.$notify({
                            text: `Máquina ${this.editedItem.id} trasladada correctamente`,
                            type: 'exito'
                        });
                        //Guardar nombreLugar en cada maquina para mostrar en tabla
                        if (response.data.lugares.length > 0) {
                            response.data.nombreLugar = response.data.lugares[0].lugarArmado.nombre;
                        }
                        Object.assign(this.serverItems[this.editedIndex], response.data);
                        this.filtroPrestador = null;
                        this.filtroLugar = null;
                        this.close();
                        this.closeTraslado();
                    } else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                }).catch((error) => {
                    console.error('Error al trasladar la máquina', error);
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al trasladar la máquina', error);
            }
        },
        async actualizarMaquina() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let maquinaActualizada = {
                    nmaquina: this.editedItem.nmaquina,
                    nombre: this.editedItem.nombre,
                    marca: this.editedItem.marca,
                    modelo: this.editedItem.modelo,
                    estado: this.guiaDespacho !== '' ? this.nuevoEstado : this.editedItem.estado,
                }
                await axios.patch(`/maquina/${this.editedItem.id}`, { maquina: maquinaActualizada, guia: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.$notify({
                            text: `Máquina ${this.editedItem.id} trasladada correctamente`,
                            type: 'exito'
                        });
                        Object.assign(this.serverItems[this.editedIndex], response.data);
                        this.close();
                        this.closeTraslado();
                    } else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                }).catch((error) => {
                    console.error('Error al actualizar la máquina', error);
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar la máquina', error);
            }
        },
    }
};
</script>

<style></style>