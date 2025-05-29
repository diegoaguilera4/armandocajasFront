<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="rut" label="RUT" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="ciudad" label="Ciudad" hide-details
                    clearable></v-text-field>
            </v-col>

        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Prestadores por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:[`item.monedas`]="{ item }">
            <div>
                <span v-for="(m, index) in item.monedas" :key="index">
                    {{ m }}<span v-if="index < item.monedas.length - 1">, </span>
                </span>
            </div>
        </template>
        <template v-slot:[`item.zonasNombres`]="{ item }">
            <div>
                <span v-for="(z, index) in item.zonasNombres" :key="index">
                    {{ z }}<span v-if="index < item.zonasNombres.length - 1">, </span>
                </span>
                <!-- <div v-for="(z, index) in item.zonasNombres" :key="index">
                    <v-chip size="small">{{ z }}</v-chip>
                </div> -->
            </div>
        </template>
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Prestadores de servicios<v-icon class="mx-2">mdi-package</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="800px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="green"
                            @click="exportarExcel()">Exportar</v-btn>
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px; margin-left: 10px;" dark v-bind="props">
                            Nuevo prestador
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-h6 text-wrap">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-package" v-model="editedItem.nombre"
                                            label="Nombre" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-package" v-model="editedItem.nombreCorto"
                                            label="Nombre corto" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-key" v-model="editedItem.rut" label="Rut"
                                            :rules="[rules.required, rules.rut]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-phone" v-model="editedItem.celular"
                                            label="Celular (+56)" type="number"
                                            :rules="[rules.required, rules.celular]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-email" v-model="editedItem.correo"
                                            label="Correo" :rules="[rules.required, rules.email]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-account" v-model="editedItem.contacto"
                                            label="Contacto" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field prepend-inner-icon="mdi-file-sign"
                                            v-model="editedItem.contratoNro" label="Contrato número"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-select prepend-inner-icon="mdi-cash" v-model="editedItem.monedas"
                                            label="Moneda" :items="monedas" multiple chips></v-select>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-number-input v-model="editedItem.rangoPrecio" :reverse="false" :step="100000"
                                            controlVariant="split" label="Rango precio" :hideInput="false" inset
                                            variant="solo-filled" :min="1"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-city" v-model="ciudadSeleccionada"
                                            :items="ciudades" item-title="CIUDAD" label="Ciudad"
                                            :item-value="ciudad => ciudad" chips>
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="item.raw.PROVINCIA + '-' + item.raw.REGION + ' (' + item.raw.NUM_REGION.trim() + ')'"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12" style="margin-bottom: -30px">
                                        <v-select prepend-inner-icon="mdi-map" v-model="editedItem.zonas" :items="zonas"
                                            item-title="nombre" item-value="id" label="Zonas" multiple chips clearable>
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'ID:' + item.raw.id"></v-list-item>
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
                                ¿Estás seguro que deseas eliminar este prestador?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.nombreCorto }}
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
                    <v-icon v-if="mostrarAcciones" v-bind="props" class="me-2" size="large" color="#689F38"
                        @click="editItem(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="mostrarAcciones" text="Miembros" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#2196F3" @click="miembros(item)">
                        mdi-account-group
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="mostrarAcciones" text="Folios" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#FB8C00" @click="asignarFolios(item)">
                        mdi-ticket
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="mostrarAcciones" text="Servicios" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#C0CA33" @click="configurarPrecios(item)">
                        mdi-hammer-screwdriver
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="!mostrarAcciones || esAdmin" text="Adhesivos" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#26A69A" @click="adhesivos(item)">
                        mdi-water
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="mostrarAcciones" text="Eliminar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="deleteItem(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
            <v-switch v-model="item.estado" color="primary" false-value="bloqueado" true-value="activo"
                @change="cambiarEstado(item)">
            </v-switch>
            <p style="margin-top: -35px;">
                {{ item.estado }}
            </p>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogEstado" max-width="550px" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">Comentario de cambio de estado</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-textarea prepend-inner-icon="mdi-comment" v-model="comentario" label="Comentario"
                            :rules="[rules.required]"></v-textarea>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="guardarEstado()">Guardar</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombreCorto', align: 'start', sortable: false },
            { title: 'RUT', key: 'rut', align: 'start', sortable: false },
            { title: 'Celular', key: 'celular', align: 'start', sortable: false },
            { title: 'Monedas', key: 'monedas', align: 'start', sortable: false },
            { title: 'Rango precio', key: 'rangoPrecio', align: 'start', sortable: false },
            { title: 'Ciudad', key: 'ciudad', align: 'start', sortable: false },
            { title: 'N° región', key: 'regionId', align: 'start', sortable: false },
            { title: 'Zonas', key: 'zonasNombres', align: 'start', sortable: false },
            { title: 'Estado', key: 'estado', align: 'start', sortable: false },

        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        ciudad: '',
        rut: '',
        search: '',
        editedItem: {
            nombre: '',
            nombreCorto: '',
            rut: '',
            correo: '',
            celular: '',
            contacto: '',
            contratoNro: '',
            monedas: [],
            ciudad: '',
            estado: '',
            rangoPrecio: null,
            regionId: 0,
            zonas: [],
        },
        defaultItem: {
            nombre: '',
            nombreCorto: '',
            rut: '',
            correo: '',
            celular: '',
            contacto: '',
            contratoNro: '',
            monedas: [],
            ciudad: '',
            estado: '',
            rangoPrecio: null,
            regionId: 0,
            zonas: [],
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        dialogEstado: false,
        comentario: '',
        rules: {
            required: value => !!value || 'Campo requerido.',
            rut: value => {
                const pattern = /^[0-9]+-[0-9kK]{1}$/;
                return pattern.test(value) || 'RUT inválido';
            },
            celular: value => {
                const pattern = /^[0-9]{9}$/;
                return pattern.test(value) || 'Celular inválido';
            },
            email: value => {
                const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                return pattern.test(value) || 'Correo invalido'
            },
        },
        ciudadSeleccionada: null,
        ciudades: [],
        monedas: [],
        zonas: [],
        rol: null,
        rolesMomentaneo: [],
        rolAux: null,
        rolesCargados: false,
    }),
    async created() {
        await this.obtenerCiudades();
        await this.obtenerMonedas();
        await this.obtenerZonas();
        const user = JSON.parse(localStorage.getItem('user'));
        this.rol = user.rol;
        this.rolMomentaneo = user ? user.rolMomentaneo : [];
        //verificar que rolMomentaneo[0].fechaInicio < hoy < rolMomentaneo[0].fechaFin
        if (this.rolMomentaneo.length > 0) {
            const fechaInicio = new Date(this.rolMomentaneo[0].fechaInicio);
            const fechaFin = new Date(this.rolMomentaneo[0].fechaFin);
            const hoy = new Date();
            if (hoy >= fechaInicio && hoy <= fechaFin) {
                this.rolAux = this.rolMomentaneo[0].rol;
            }
        }
        this.rolesCargados = true;
        this.loading = false;
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo prestador de servicios' : 'Editar prestador de servicios'
        },
        mostrarAcciones() {
            return (this.rol !== 'gestor de adhesivo' && this.rolAux !== 'gestor de adhesivo');
        },
        esAdmin(){
            return this.rol === 'admin' || this.rolAux === 'admin';
        }
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
        ciudad() {
            this.search = String(Date.now());
        },
        rut() {
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
        async exportarExcel() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/prestadores/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            nombre: this.nombre,
                            ciudad: this.ciudad,
                            rut: this.rut
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'prestadores.xlsx');
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
                await axios.get(`/prestadores/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre,
                        ciudad: this.ciudad,
                        rut: this.rut
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.prestadores;
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
            this.ciudadSeleccionada = this.ciudades.find(ciudad => ciudad.CIUDAD === item.ciudad && parseInt(ciudad.NUM_REGION) === parseInt(item.regionId));
            this.dialog = true
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            await this.eliminarPrestador();
            this.closeDelete()
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                this.ciudadSeleccionada = null;
            })
        },
        closeDelete() {
            this.dialogDelete = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        asignarFolios(item) {
            this.$router.push(`/folios/${item.id}/${item.nombreCorto}`);
        },
        // Validar campos del formulario
        validarPrestador() {
            if (this.editedItem.nombre === '') {
                this.$notify({
                    text: 'Debe ingresar un nombre',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.nombreCorto === '') {
                this.$notify({
                    text: 'Debe ingresar un nombre corto',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.rut === '') {
                this.$notify({
                    text: 'Debe ingresar un rut',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.correo === '') {
                this.$notify({
                    text: 'Debe ingresar un correo',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.celular === '' || this.editedItem.celular.length !== 9) {
                this.$notify({
                    text: 'Debe ingresar un n° celular válido',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.contacto === '') {
                this.$notify({
                    text: 'Debe ingresar un contacto',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.contratoNro === '') {
                this.$notify({
                    text: 'Debe ingresar un n° de contrato',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.monedas.length === 0) {
                this.$notify({
                    text: 'Debe ingresar al menos una moneda',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.zonas.length === 0) {
                this.$notify({
                    text: 'Debe ingresar al menos una zona',
                    type: 'fallo'
                });
                return false;
            }
            if (!this.ciudadSeleccionada) {
                this.$notify({
                    text: 'Debe ingresar una ciudad',
                    type: 'fallo'
                });
                return false;
            }
            return true;
        },
        async save() {
            if (!this.validarPrestador()) {
                return;
            }
            if (this.editedIndex > -1) {
                await this.actualizarPrestador();
            } else {
                await this.nuevoPrestador();
            }
        },
        async nuevoPrestador() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const nuevoPrestador = {
                    nombre: this.editedItem.nombre,
                    nombreCorto: this.editedItem.nombreCorto,
                    rut: this.editedItem.rut,
                    correo: this.editedItem.correo,
                    celular: this.editedItem.celular,
                    contacto: this.editedItem.contacto,
                    contratoNro: this.editedItem.contratoNro,
                    monedas: this.editedItem.monedas,
                    ciudad: this.ciudadSeleccionada.CIUDAD,
                    rangoPrecio: parseInt(this.editedItem.rangoPrecio),
                    estado: 'activo',
                    regionId: parseInt(this.ciudadSeleccionada.NUM_REGION),
                    zonas: this.editedItem.zonas
                };
                await axios.post(`/prestadores`, nuevoPrestador, {
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
                        this.ciudadSeleccionada = null;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        this.search = String(Date.now());
                        this.$notify({
                            text: `Prestador ${response.data.id} creado correctamente`,
                            type: 'exito'
                        });
                        this.close();
                    }

                }).catch((error) => {
                    console.error('Error al crear nuevo prestador', error);
                    this.$notify({
                        text: 'Error al crear el prestador',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo prestador', error);
            }
        },
        async eliminarPrestador() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/prestadores/${this.editedItem.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 409) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    }
                    this.$notify({
                        text: `Prestador ${response.data.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;

                }).catch((error) => {
                    console.error('Error al eliminar un prestador', error);
                    this.$notify({
                        text: 'Error al eliminar el prestador',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar un prestador', error);
            }
        },
        async actualizarPrestador() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const prestadorActualizado = {
                    nombre: this.editedItem.nombre,
                    nombreCorto: this.editedItem.nombreCorto,
                    rut: this.editedItem.rut,
                    correo: this.editedItem.correo,
                    celular: this.editedItem.celular,
                    contacto: this.editedItem.contacto,
                    contratoNro: this.editedItem.contratoNro,
                    monedas: this.editedItem.monedas,
                    rangoPrecio: parseInt(this.editedItem.rangoPrecio),
                    ciudad: this.ciudadSeleccionada.CIUDAD,
                    regionId: parseInt(this.ciudadSeleccionada.NUM_REGION, 10),
                    zonas: this.editedItem.zonas
                };
                await axios.patch(`/prestadores/${this.editedItem.id}`, prestadorActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404 && response.data.status !== 409) {
                        this.$notify({
                            text: `Prestador ${this.editedItem.id} actualizado correctamente`,
                            type: 'exito'
                        });
                        this.ciudadSeleccionada = null;
                        this.close();
                    }
                    else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                    Object.assign(this.serverItems[this.editedIndex], response.data);
                }).catch((error) => {
                    console.error('Error al actualizar el prestador', error);
                    this.$notify({
                        text: 'Error al actualizar el prestador',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar un nuevo', error);
            }
        },
        async obtenerCiudades() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/database/obtenerCiudades`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.ciudades = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las ciudades', error);
                });
            } catch (error) {
                console.error('Error al cargar las ciudades', error);
            }
        },
        async obtenerMonedas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/database/obtenerMonedas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.monedas = response.data.map(item => item.MONEDAOFICIAL);
                }).catch((error) => {
                    console.error('Error al cargar las ciudades', error);
                });
            } catch (error) {
                console.error('Error al cargar las ciudades', error);
            }
        },
        async obtenerZonas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/zonas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.zonas = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las zonas', error);
                });
            } catch (error) {
                console.error('Error al cargar las zonas', error);
            }
        },
        miembros(item) {
            this.$router.push(`/miembros/${item.id}/${item.nombreCorto}`);
        },
        configurarPrecios(item) {
            this.$router.push(`/serviciosPrestador/${item.id}/${item.nombreCorto}`);
        },
        adhesivos(item) {
            this.$router.push(`/adhesivosPrestador/${item.id}/${item.nombreCorto}`);
        },
        async guardarEstado() {
            try {
                if (this.comentario === '') {
                    this.$notify({
                        text: 'Debe ingresar un comentario',
                        type: 'fallo'
                    });
                    return false;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.patch(`/prestadores/estado/${this.editedItem.id}`, { estado: this.editedItem.estado, comentario: this.comentario }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Estado de prestador ${response.data.id} actualizado a ${this.editedItem.estado}`,
                        type: 'exito'
                    });
                    this.dialogEstado = false;
                    this.comentario = '';
                }).catch((error) => {
                    console.error('Error al actualizar el estado de prestador', error);
                    this.$notify({
                        text: 'Error al actualizar el estado de prestador',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el estado de prestador', error);
            }
        },
        cambiarEstado(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogEstado = true;
        }
    }
};
</script>

<style></style>