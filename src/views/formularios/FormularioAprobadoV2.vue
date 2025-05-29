<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-container>
                <v-sheet v-if="loading" class="d-flex justify-center align-center"
                    style="background-color: transparent; border-radius: 20px; max-width: 500px; margin: auto; height: 80vh;">
                    <v-col justify="center">
                        <v-row justify="center">
                            <v-progress-circular indeterminate></v-progress-circular>
                        </v-row>
                        <v-row justify="center">
                            Cargando... por favor espere
                        </v-row>
                    </v-col>
                </v-sheet>
                <template v-if="!loading">
                    <v-card style="background-color: surface; border-radius: 20px; margin-top: -40px">
                        <v-row align="center">
                            <v-col cols="12" md="4" sm="4">
                                <v-img src="../../assets/csf.png" height="45px"
                                    style="margin-top: 20px; margin-bottom: 20px;"></v-img>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-title>ARMADO DE CAJAS</v-card-title>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-text>
                                    {{ usuario.nombre }} - {{ usuario.rol }}
                                </v-card-text>
                                <v-card-text>
                                    {{ usuario.empresa }}
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title>
                        </v-card-title>
                        <v-row justify="center">
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-number-input rounded="xl" v-model="nroFolio" :reverse="false" :min="1"
                                    controlVariant="split" label="Folio" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-select prepend-inner-icon="mdi-calendar-clock" v-model="temporadaSeleccionada"
                                    variant="solo-filled" label="Temporada" chips :items="temporadas"
                                    item-title="nombre" item-value="id">
                                </v-select>
                            </v-col>
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-locale-provider locale="es">
                                    <v-date-input v-model="fechaArmado" label="Fecha de armado" prepend-icon=""
                                        append-inner-icon="$calendar" variant="solo-filled" cancel-text="cancelar"
                                        ok-text="seleccionar"></v-date-input>
                                </v-locale-provider>
                            </v-col>
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-locale-provider locale="es">
                                    <v-date-input v-model="fechaCreacion" label="Fecha de creación" prepend-icon=""
                                        append-inner-icon="$calendar" bg-color="grey" class="no-editable"
                                        variant="solo-filled" disabled></v-date-input>
                                </v-locale-provider>
                            </v-col>
                            <!-- <v-col cols="12" lg="2" md="3" sm="4">
                                <v-text-field bg-color="grey" class="no-editable"
                                    v-model="formularioAntiguo.lugarArmado.nombre" label="Lugar de armado" disabled
                                    variant="solo-filled"></v-text-field>
                            </v-col> -->
                            <v-col cols="12" lg="2" md="3" sm="4">
                                <v-select v-model="formularioAntiguo.lugarArmadoId" label="Lugar de armado"
                                    variant="solo-filled" chips :items="lugaresPrestador" item-title="nombre"
                                    item-value="id">
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col v-if="!formularioAntiguo.esExterno" cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="formularioAntiguo.nv"
                                    label="NV" disabled variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col v-if="!formularioAntiguo.esExterno" cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="formularioAntiguo.codCsf"
                                    label="Código" disabled variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col v-if="!formularioAntiguo.esExterno" cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable" v-model="formularioAntiguo.rutCliente"
                                    label="RUT Cliente" variant="solo-filled" disabled></v-text-field>
                            </v-col>
                            <v-col v-if="formularioAntiguo.esExterno" cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable"
                                    v-model="formularioAntiguo.nombreExterno" label="Nombre externo"
                                    variant="solo-filled" disabled></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable"
                                    v-model="formularioAntiguo.nombreCliente" label="Nombre cliente"
                                    variant="solo-filled" disabled></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field bg-color="grey" class="no-editable"
                                    v-model="formularioAntiguo.descripcion" label="Descripcion" variant="solo-filled"
                                    disabled></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            SERVICIOS
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="4" md="4" sm="4">
                                <v-select prepend-inner-icon="mdi-hammer-screwdriver" v-model="servicioSeleccionadoCaja"
                                    label="Servicio caja" chips :items="serviciosCaja" item-title="descripcion"
                                    item-value="id" variant="solo-filled">
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props"
                                            :subtitle="item.raw.codigo + ' - Precios: rango 1: $' + item.raw.precio1 + ' - rango 2: $' + item.raw.precio2"></v-list-item>
                                    </template>
                                </v-select>
                            </v-col>
                            <v-col cols="12" lg="4" md="4" sm="4">
                                <v-select prepend-inner-icon="mdi-hammer-screwdriver"
                                    v-model="serviciosSeleccionadosOtros" label="Servicios otros" chips clearable
                                    :items="serviciosOtros" item-title="descripcion" item-value="id"
                                    variant="solo-filled" multiple>
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props"
                                            :subtitle="item.raw.codigo + ' - Precios: rango 1: $' + item.raw.precio1 + ' - rango 2: $' + item.raw.precio2"></v-list-item>
                                    </template>
                                </v-select>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            CAJAS
                        </v-card-title>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" v-model="cajas.cajasTotales" :reverse="false"
                                    controlVariant="split" label="Cajas totales" :min="cajas.cajasBuenas + sumaMermas"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" v-model="cajas.cajasBuenas" :reverse="false"
                                    controlVariant="split" label="Cajas buenas" :max="cajas.cajasTotales - sumaMermas"
                                    :min="0" :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-text-field rounded="xl" v-model="mermasTotales" bg-color="grey" class="no-editable"
                                    label="Mermas totales" variant="solo-filled" disabled></v-text-field>
                            </v-col>
                        </v-row>
                        <v-divider></v-divider>
                        <v-card-title class="d-flex justify-center">
                            MERMAS
                        </v-card-title>
                        <p class="d-flex justify-center">
                            TOTAL: {{ mermasTotales }} - LLEVAS: {{ sumaMermas }} - FALTAN: {{ mermasTotales -
                                sumaMermas }}
                        </p>
                        <v-row justify="center" style="margin-top: 20px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasArmado"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaMaquina" controlVariant="split" label="Armado" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasFabricacion"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasAlmacenaje - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaFabricacion" controlVariant="split" label="Fabricación" :hideInput="false"
                                    inset></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasAlmacenaje"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasTransporte - cajas.noPasadasMaquina"
                                    :min="sumaPacking" controlVariant="split" label="Almacenaje" :hideInput="false"
                                    inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.mermasTransporte"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.noPasadasMaquina"
                                    :min="sumaTransporte - cajas.noPasadasMaquina" controlVariant="split"
                                    label="Transporte" :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorError" v-model="cajas.noPasadasMaquina"
                                    :reverse="false"
                                    :max="mermasTotales - cajas.mermasArmado - cajas.mermasFabricacion - cajas.mermasAlmacenaje - cajas.mermasTransporte"
                                    :min="sumaTransporte - cajas.mermasTransporte" controlVariant="split"
                                    label="No pasadas por máquina" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeError }}
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-title class="d-flex justify-center">
                            DETALLE DE MERMAS
                        </v-card-title>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            ARMADO
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasArmado }} - LLEVAS: {{ sumaMaquina }} - FALTAN: {{ cajas.mermasArmado
                                - sumaMaquina }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.seteo" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.adhesivo - detalleMermas.maquina.trancon
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Seteo" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.adhesivo" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.trancon
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Adhesivo" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.trancon" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.adhesivo - detalleMermas.maquina.seteo
                                        - detalleMermas.maquina.fallaMaquina - detalleMermas.maquina.otrosMaquina"
                                    :min="0" controlVariant="split" label="Trancón" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.fallaMaquina" :reverse="false" :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.adhesivo
                                        - detalleMermas.maquina.trancon - detalleMermas.maquina.otrosMaquina" :min="0"
                                    controlVariant="split" label="Falla Máquina" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorMaquina"
                                    v-model="detalleMermas.maquina.otrosMaquina" :reverse="false"
                                    :max="cajas.mermasArmado - detalleMermas.maquina.seteo - detalleMermas.maquina.adhesivo - detalleMermas.maquina.trancon - detalleMermas.maquina.fallaMaquina"
                                    :min="0" controlVariant="split" label="Otros" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorMaquina }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            FABRICACIÓN
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasFabricacion }} - LLEVAS: {{ sumaFabricacion }} - FALTAN: {{
                                cajas.mermasFabricacion -
                                sumaFabricacion }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.impresion" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.troquel - this.detalleMermas.fabricacion.laminado
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Amarre"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.troquel" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.laminado
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Troquel"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.laminado" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Laminado"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.recorte" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.laminado - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Recorte"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.rayado" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.impresion - this.detalleMermas.fabricacion.troquel
                                        - this.detalleMermas.fabricacion.laminado - this.detalleMermas.fabricacion.recorte" :min="0" controlVariant="split" label="Rayado"
                                    :hideInput="false" inset variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorFabricacion }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            ALMACENAJE
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasAlmacenaje }} - LLEVAS: {{ sumaPacking }} - FALTAN: {{
                                cajas.mermasAlmacenaje -
                                sumaPacking }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.humedad" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Humedad" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.sol" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Sol" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.danioGrua" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.rotas - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Daño Grua" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.rotas" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.otrosPacking"
                                    :min="0" controlVariant="split" label="Rotas" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorPacking"
                                    v-model="detalleMermas.packing.otrosPacking" :reverse="false"
                                    :max="cajas.mermasAlmacenaje - detalleMermas.packing.humedad - detalleMermas.packing.sol - detalleMermas.packing.danioGrua - detalleMermas.packing.rotas"
                                    :min="0" controlVariant="split" label="Otros" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorPacking }}
                        </v-card-text>
                        <p class="d-flex justify-center" style="margin-top: 20px; font-weight: bold;">
                            TRANSPORTE
                        </p>
                        <p class="d-flex justify-center">
                            TOTAL: {{ cajas.mermasTransporte }} - LLEVAS: {{ sumaTransporte }} - FALTAN: {{
                                cajas.mermasTransporte -
                                sumaTransporte }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorTransporte"
                                    v-model="detalleMermas.transporte.amarre" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Amarre" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorTransporte"
                                    v-model="detalleMermas.transporte.paletizaje" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.amarre - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Paletizaje" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorTransporte"
                                    v-model="detalleMermas.transporte.enzunchado" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.amarre - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Enzunchado" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorTransporte"
                                    v-model="detalleMermas.transporte.stretchFilm" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.amarre - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Stretch Film" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorTransporte"
                                    v-model="detalleMermas.transporte.proteccion" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.amarre"
                                    :min="0" controlVariant="split" label="Protección" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                        </v-row>
                        <v-card-text class="d-flex justify-center" style="color: red;">
                            {{ mensajeErrorTransporte }}
                        </v-card-text>
                    </v-card>
                    <!-- Dialogo de máquina -->
                    <v-dialog v-model="dialogMaquina" max-width="650px">
                        <v-card style="border-radius: 20px; padding: 10px;">
                            <div v-if="!problemaMaquina">
                                <v-card-text class="text-center font-weight-bold">
                                    Al hacer click en aceptar se mostraran todas las máquinas
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="elevated" @click="closeMaquina">Cancelar</v-btn>
                                    <v-btn color="primary" variant="elevated" @click="mostrarMaquinas">Aceptar</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </div>
                            <div v-else>
                                <v-card-text class="text-center font-weight-bold">
                                    Al hacer click en aceptar se mostrarán solo las máquinas del lugar de armado
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="elevated" @click="closeMaquina">Cancelar</v-btn>
                                    <v-btn color="primary" variant="elevated"
                                        @click="mostrarMaquinasLugar">Aceptar</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </div>
                        </v-card>
                    </v-dialog>
                    <!-- Dialogo de adhesivo -->
                    <v-dialog v-model="dialogAdhesivo" max-width="650px">
                        <v-card style="border-radius: 20px; padding: 10px;">
                            <div v-if="!problemaAdhesivo">
                                <v-card-text class="text-center font-weight-bold">
                                    Al hacer click en aceptar se mostraran todos los adhesivos
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="elevated" @click="closeAdhesivos">Cancelar</v-btn>
                                    <v-btn color="primary" variant="elevated" @click="mostrarAdhesivos">Aceptar</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </div>
                            <div v-else>
                                <v-card-text class="text-center font-weight-bold">
                                    Al hacer click en aceptar se mostrarán solo los adhesivos del lugar de
                                    armado
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="elevated" @click="closeAdhesivos">Cancelar</v-btn>
                                    <v-btn color="primary" variant="elevated"
                                        @click="mostrarAdhesivosLugar">Aceptar</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </div>
                        </v-card>
                    </v-dialog>
                    <MaquinaAdhesivoTroquel v-model:tipoMaquina="tipoMaquina"
                        v-model:maquinaSeleccionada="maquinaSeleccionada" :maquinas="maquinas"
                        :itemsMaquina="itemsMaquina" :problemaMaquina="problemaMaquina"
                        v-model:maquinaExterna="maquinaExterna" v-model:tipoAdhesivo="tipoAdhesivo"
                        v-model:adhesivoSeleccionadoId="adhesivoSeleccionadoId"
                        v-model:adhesivoSeleccionado="adhesivoSeleccionado" :adhesivos="adhesivos"
                        :stockAdhesivo="stockAdhesivo" v-model:adhesivoKilos="adhesivoKilos"
                        v-model:nroLoteAdhesivo="nroLoteAdhesivo" :problemaAdhesivo="problemaAdhesivo"
                        v-model:adhesivoExterno="adhesivoExterno" v-model:nroTroquel="nroTroquel"
                        @open-dialog-maquina="dialogMaquina = true" @open-dialog-adhesivo="dialogAdhesivo = true" />
                    <DetencionesMaquina :detenciones="detenciones" :tiposDetencion="tiposDetencion"
                        @agregar="agregarDetencion" @eliminar="eliminarDetencion" />
                    <TiempoProduccion :turno="turno" />
                    <ObservacionesForm v-model:observaciones="observaciones" :rules="rules" />
                    <v-row justify="center" style="margin-top: 20px">
                        <v-btn color="error" @click="$router.push('/preliquidar')">Cancelar</v-btn>
                        <v-btn color="primary" style="margin-left: 10px;" @click="guardar()">Guardar</v-btn>
                    </v-row>
                </template>
            </v-container>
        </v-main>
    </v-app>


</template>

<script>
import DetencionesMaquina from '@/components/formularios/DetencionesMaquina.vue';
import MaquinaAdhesivoTroquel from '@/components/formularios/MaquinaAdhesivoTroquel.vue';
import ObservacionesForm from '@/components/formularios/ObservacionesForm.vue';
import TiempoProduccion from '@/components/formularios/TiempoProduccion.vue';
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import axios from 'axios';
import { ref } from 'vue';
export default {
    components: {
        DrawerMenu,
        DetencionesMaquina,
        TiempoProduccion,
        ObservacionesForm,
        MaquinaAdhesivoTroquel
    },
    data() {
        return {
            loading: true,
            nroFolio: 1,
            folio: {},
            usuario: {
                nombre: '',
                rol: '',
                lugar: '',
                empresa: ''
            },
            maquina: {
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            },
            adhesivo: {
                marca: '',
                descripcion: ''
            },
            cajas: {
                cajasTotales: 0,
                cajasBuenas: 0,
                mermasTotales: 0,
                mermasArmado: 0,
                mermasFabricacion: 0,
                mermasAlmacenaje: 0,
                mermasTransporte: 0,
                noPasadasMaquina: 0
            },
            detalleMermas: {
                transporte: {
                    amarre: 0,
                    paletizaje: 0,
                    enzunchado: 0,
                    stretchFilm: 0,
                    proteccion: 0,
                },
                fabricacion: {
                    impresion: 0,
                    troquel: 0,
                    laminado: 0,
                    recorte: 0,
                    rayado: 0,
                },
                packing: {
                    humedad: 0,
                    sol: 0,
                    danioGrua: 0,
                    rotas: 0,
                    otrosPacking: 0,
                },
                maquina: {
                    seteo: 0,
                    adhesivo: 0,
                    trancon: 0,
                    fallaMaquina: 0,
                    otrosMaquina: 0,
                }
            },
            maquinas: [],
            maquinaSeleccionada: {
                id: 0,
                nmaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            },
            adhesivoSeleccionado: {
                id: 0,
                marca: '',
                descripcion: ''
            },
            adhesivoSeleccionadoId: null,
            adhesivos: [],
            observaciones: '',
            fechaArmado: ref(new Date()),
            fechaCreacion: new Date(),
            rules: [v => v.length <= 400 || 'Máximo 400 caracteres'],
            tipo: '',
            armadoSaldo: {},
            formularioAntiguo: {},
            nuevoKardexId: 0,
            adhesivoKilos: null,
            serviciosCaja: [],
            serviciosOtros: [],
            servicioSeleccionadoCaja: null,
            serviciosSeleccionadosOtros: [],
            colorError: 'default',
            colorErrorFabricacion: 'default',
            colorErrorPacking: 'default',
            colorErrorMaquina: 'default',
            colorErrorTransporte: 'default',
            hayError: false,
            hayErrorFabricacion: false,
            hayErrorPacking: false,
            hayErrorMaquina: false,
            hayErrorTransporte: false,
            mensajeError: '',
            mensajeErrorFabricacion: '',
            mensajeErrorPacking: '',
            mensajeErrorMaquina: '',
            mensajeErrorTransporte: '',
            tiposDetencion: [],
            detenciones: [
                { tipo: null, inicio: '', fin: '', observacion: '', menuInicio: false, menuFin: false }
            ],
            turno: {
                horaInicio: '',
                horaFin: '',
                turno: null,
                menuInicio: false,
                menuFin: false
            },
            adhesivosStock: [],
            stockAdhesivo: null,
            sumaStock: 0,
            temporadas: [],
            temporadaSeleccionada: null,
            folioValido: false,
            maquinasTodas: [],
            adhesivosTodos: [],
            problemaAdhesivo: false,
            problemaMaquina: false,
            dialogAdhesivo: false,
            dialogMaquina: false,
            adhesivoStockLugar: [],
            tipoMaquina: 'CSF',
            tipoAdhesivo: 'CSF',
            maquinaExterna: '',
            nroTroquel: '',
            nroLoteAdhesivo: '',
            adhesivoExterno: '',
            lugaresPrestador: [],
        }
    },
    computed: {
        mermasTotales() {
            return this.cajas.cajasTotales - this.cajas.cajasBuenas;
        },
        sumaMermas() {
            return this.cajas.mermasArmado + this.cajas.mermasFabricacion + this.cajas.mermasAlmacenaje + this.cajas.mermasTransporte + this.cajas.noPasadasMaquina;
        },
        sumaFabricacion() {
            return this.detalleMermas.fabricacion.impresion + this.detalleMermas.fabricacion.troquel + this.detalleMermas.fabricacion.laminado + this.detalleMermas.fabricacion.recorte + this.detalleMermas.fabricacion.rayado;
        },
        sumaPacking() {
            return this.detalleMermas.packing.humedad + this.detalleMermas.packing.sol + this.detalleMermas.packing.danioGrua + this.detalleMermas.packing.rotas + this.detalleMermas.packing.otrosPacking;
        },
        sumaMaquina() {
            return this.detalleMermas.maquina.seteo + this.detalleMermas.maquina.adhesivo + this.detalleMermas.maquina.trancon + this.detalleMermas.maquina.fallaMaquina + this.detalleMermas.maquina.otrosMaquina;
        },
        sumaTransporte() {
            return this.detalleMermas.transporte.amarre + this.detalleMermas.transporte.paletizaje + this.detalleMermas.transporte.enzunchado + this.detalleMermas.transporte.stretchFilm + this.detalleMermas.transporte.proteccion;
        }
    },
    watch: {
        maquinaSeleccionada(newVal) {
            if (!newVal) {
                this.maquinaSeleccionada = {
                    id: 0,
                    nroMaquina: '',
                    nombre: '',
                    marca: '',
                    modelo: ''
                }
            }
        },
        tipoMaquina(newVal) {
            if (newVal === 'Externa') {
                this.maquinaSeleccionada = {
                    id: 0,
                    nroMaquina: '',
                    nombre: '',
                    marca: '',
                    modelo: ''
                }
            }
            else {
                this.maquinaExterna = '';
            }
        },
        tipoAdhesivo(newVal) {
            if (newVal === 'Externo') {
                this.adhesivoSeleccionadoId = null;
                this.adhesivoSeleccionado = {
                    id: 0,
                    codigo: '',
                    descripcion: '',
                    descripcion2: ''
                }
                this.stockAdhesivo = null;
            }
            else {
                this.adhesivoExterno = '';
            }
        },
        adhesivoSeleccionadoId(newVal) {
            if (this.adhesivoSeleccionadoId) {
                //setear adhesivoSeleccionado
                let adhesivoSel = this.adhesivos.find(adhesivo => adhesivo.id === newVal);
                if (adhesivoSel) {
                    //guardar stock de ese adhesivo
                    this.adhesivoSeleccionado = adhesivoSel;
                    if (!this.problemaAdhesivo) {
                        let adhesivoLugar = this.adhesivoStockLugar.find(adhesivo => adhesivo.adhesivoId === newVal);
                        this.stockAdhesivo = adhesivoLugar.kilosDisponibles;
                        //Si es el mismo adhesivo que el anterior, se agrega lo declarado en el formulario antiguo
                        if (adhesivoSel.id === this.formularioAntiguo.adhesivoId) {
                            this.sumaStock = this.formularioAntiguo.kilosAdhesivo;
                            this.adhesivoKilos = this.formularioAntiguo.kilosAdhesivo;
                        }
                        //Si es un adhesivo nuevo, se agrega el stock actual sin sumar nada
                        else {
                            this.sumaStock = 0;
                            this.adhesivoKilos = 0;
                        }
                    }
                }
                else {
                    this.stockAdhesivo = null;
                }
            } else {
                this.adhesivoSeleccionado = {
                    id: 0,
                    marca: '',
                    descripcion: ''
                };
                this.stockAdhesivo = null;
                this.sumaStock = 0;
            }
        },
        sumaMermas() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';
            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';
            }
        },
        'cajas.cajasTotales'() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';

            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';
            }
        },
        'cajas.cajasBuenas'() {
            if (this.sumaMermas != this.mermasTotales) {
                this.colorError = '#FFCDD2';
                this.hayError = true;
                this.mensajeError = '**La suma de mermas no coincide con mermas totales';
            }
            else {
                this.colorError = '#C8E6C9';
                this.hayError = false;
                this.mensajeError = '';
            }
        },
        sumaFabricacion() {
            if (this.sumaFabricacion != this.cajas.mermasFabricacion) {
                this.colorErrorFabricacion = '#FFCDD2';
                this.hayErrorFabricacion = true;
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no coincide con mermas de fabricación';
            }
            else {
                this.colorErrorFabricacion = '#C8E6C9';
                this.hayErrorFabricacion = false;
                this.mensajeErrorFabricacion = '';
            }
        },
        'cajas.mermasFabricacion'() {
            if (this.sumaFabricacion != this.cajas.mermasFabricacion) {
                this.colorErrorFabricacion = '#FFCDD2';
                this.hayErrorFabricacion = true;
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no coincide con mermas de fabricación';
            }
            else {
                this.colorErrorFabricacion = '#C8E6C9';
                this.hayErrorFabricacion = false;
                this.mensajeErrorFabricacion = '';
            }
        },
        sumaPacking() {
            if (this.sumaPacking != this.cajas.mermasAlmacenaje) {
                this.colorErrorPacking = '#FFCDD2';
                this.hayErrorPacking = true;
                this.mensajeErrorPacking = '**La suma de mermas de packing no coincide con mermas de almacenaje';
            }
            else {
                this.colorErrorPacking = '#C8E6C9';
                this.hayErrorPacking = false;
                this.mensajeErrorPacking = '';
            }
        },
        'cajas.mermasAlmacenaje'() {
            if (this.sumaPacking != this.cajas.mermasAlmacenaje) {
                this.colorErrorPacking = '#FFCDD2';
                this.hayErrorPacking = true;
                this.mensajeErrorPacking = '**La suma de mermas de packing no coincide con mermas de almacenaje';
            }
            else {
                this.colorErrorPacking = '#C8E6C9';
                this.hayErrorPacking = false;
                this.mensajeErrorPacking = '';
            }
        },
        sumaMaquina() {
            if (this.sumaMaquina != this.cajas.mermasArmado) {
                this.colorErrorMaquina = '#FFCDD2';
                this.hayErrorMaquina = true;
                this.mensajeErrorMaquina = '**La suma de mermas de máquina no coincide con mermas de armado';
            }
            else {
                this.colorErrorMaquina = '#C8E6C9';
                this.hayErrorMaquina = false;
                this.mensajeErrorMaquina = '';
            }
        },
        'cajas.mermasArmado'() {
            if (this.sumaMaquina != this.cajas.mermasArmado) {
                this.colorErrorMaquina = '#FFCDD2';
                this.hayErrorMaquina = true;
                this.mensajeErrorMaquina = '**La suma de mermas de máquina no coincide con mermas de armado';
            }
            else {
                this.colorErrorMaquina = '#C8E6C9';
                this.hayErrorMaquina = false;
                this.mensajeErrorMaquina = '';
            }
        },
        sumaTransporte() {
            if (this.sumaTransporte != (this.cajas.mermasTransporte)) {
                this.colorErrorTransporte = '#FFCDD2';
                this.hayErrorTransporte = true;
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no coincide con mermas de transporte';
            }
            else {
                this.colorErrorTransporte = '#C8E6C9';
                this.hayErrorTransporte = false;
                this.mensajeErrorTransporte = '';
            }
        },
        'cajas.mermasTransporte'() {
            if (this.sumaTransporte != (this.cajas.mermasTransporte)) {
                this.colorErrorTransporte = '#FFCDD2';
                this.hayErrorTransporte = true;
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no coincide con mermas de transporte';
            }
            else {
                this.colorErrorTransporte = '#C8E6C9';
                this.hayErrorTransporte = false;
                this.mensajeErrorTransporte = '';
            }
        },
        async temporadaSeleccionada() {
            //vaciar arreglos de servicios
            if (this.temporadaSeleccionada !== this.formularioAntiguo.temporadaId) {
                this.servicioSeleccionadoCaja = [];
                this.serviciosSeleccionadosOtros = [];
            }
            //obtener servicios
            await this.obtenerServicios();
        },
        async 'formularioAntiguo.lugarArmadoId'() {
            if(this.formularioAntiguo.lugarArmado.id !== this.formularioAntiguo.lugarArmadoId){
                this.servicioSeleccionadoCaja = [];
                this.serviciosSeleccionadosOtros = [];
            }
            await this.obtenerServicios();
            await this.obtenerAdhesivos();
            await this.obtenerMaquinas();
        }
    },
    async created() {
        const user = JSON.parse(localStorage.getItem('user'));
        this.usuario.nombre = user.nombre;
        this.usuario.rol = user.rol;
        await this.obtenerArmado();
        await this.obtenerAdhesivos();
        await this.obtenerTodosAdhesivos();
        await this.obtenerTemporadas();
        await this.obtenerServicios();
        await this.obtenerDetenciones();
        await this.obtenerMaquinas();
        await this.obtenerTodasMaquinas();
        await this.obtenerLugares();
        this.loading = false;
    },
    methods: {
        async obtenerLugares() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/lugarArmados/prestador`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        prestadorId: this.formularioAntiguo.prestadorId,
                    }
                }).then((response) => {
                    this.lugaresPrestador = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los lugares', error);
                });
            } catch (error) {
                console.error('Error al cargar los lugares', error);
            }
        },
        closeMaquina() {
            this.dialogMaquina = false;
        },
        mostrarMaquinas() {
            this.dialogMaquina = false;
            this.maquinas = this.maquinasTodas;
            this.problemaMaquina = true;
            this.maquinaSeleccionada = {
                id: 0,
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            }
        },
        mostrarMaquinasLugar() {
            this.dialogMaquina = false;
            this.maquinas = this.maquinasLugar;
            this.problemaMaquina = false;
            this.maquinaSeleccionada = {
                id: 0,
                nroMaquina: '',
                nombre: '',
                marca: '',
                modelo: ''
            }
        },
        closeAdhesivos() {
            this.dialogAdhesivo = false;
        },
        mostrarAdhesivos() {
            this.dialogAdhesivo = false;
            this.adhesivos = this.adhesivosTodos;
            this.problemaAdhesivo = true;
            this.adhesivoSeleccionadoId = null;
            this.adhesivoSeleccionado = {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            }
            this.adhesivoKilos = null;
        },
        mostrarAdhesivosLugar() {
            this.dialogAdhesivo = false;
            this.adhesivos = this.adhesivoStockLugar.map(adhesivo => adhesivo.adhesivo);
            this.problemaAdhesivo = false;
            this.adhesivoSeleccionadoId = null;
            this.adhesivoSeleccionado = {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            }
            this.adhesivoKilos = null;
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
                    //solo poner las ultimas 3 temporadas
                    this.temporadas = this.temporadas.slice(0, 3);
                    if (!this.formularioAntiguo.temporadaId) {
                        this.temporadaSeleccionada = this.temporadas[0].id;
                    }
                    else {
                        this.temporadaSeleccionada = this.formularioAntiguo.temporadaId;
                    }
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
        agregarDetencion() {
            this.detenciones.push({ tipo: null, inicio: '', fin: '', observacion: '', menuInicio: false, menuFin: false });
        },
        eliminarDetencion(index) {
            this.detenciones.splice(index, 1);
        },
        itemsMaquina(item) {
            return {
                title: item.nmaquina,
            }
        },
        itemsAdhesivo(item) {
            return {
                title: item.marca,
            }
        },
        async obtenerDetenciones() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/tipoDetencion`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.tiposDetencion = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las detenciones', error);
                });
            } catch (error) {
                console.error('Error al cargar las detenciones', error);
            }
        },
        async obtenerArmado() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/armados/obtener/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.formularioAntiguo = response.data;
                    if (this.formularioAntiguo.estado !== 'aprobado') {
                        this.$notify({
                            text: 'No está disponible la edición de este formulario',
                            type: 'fallo'
                        });
                        this.$router.push('/');
                    }
                    this.turno = {
                        horaInicio: this.formularioAntiguo.horaInicioTurno,
                        horaFin: this.formularioAntiguo.horaFinTurno,
                        turno: this.formularioAntiguo.turno,
                        menuInicio: false,
                        menuFin: false
                    }
                    this.detenciones = this.formularioAntiguo.detencionesMaquina.map(detencion => {
                        return {
                            tipo: detencion.tipo,
                            inicio: detencion.inicio,
                            fin: detencion.fin,
                            observacion: detencion.observacion,
                            menuInicio: false,
                            menuFin: false
                        }
                    });
                    //setear datos
                    this.nroFolio = this.formularioAntiguo.nroFolio;
                    //setear cajas
                    Object.assign(this.cajas, {
                        cajasTotales: this.formularioAntiguo.cajasTotales,
                        cajasBuenas: this.formularioAntiguo.cajasBuenas,
                        mermasArmado: this.formularioAntiguo.mermasArmado,
                        mermasFabricacion: this.formularioAntiguo.mermasFabricacion,
                        mermasAlmacenaje: this.formularioAntiguo.mermasAlmacenaje,
                        mermasTransporte: this.formularioAntiguo.mermasTransporte,
                        noPasadasMaquina: this.formularioAntiguo.noPasadasPorMaquina
                    });
                    //imprimir cada valor de this.detalleMermas con su key y value
                    for (const [, value] of Object.entries(this.detalleMermas)) {
                        for (const [subKey,] of Object.entries(value)) {
                            const detalle = this.formularioAntiguo.detallesMerma.find(d => d.tipo === subKey);
                            if (detalle) {
                                value[subKey] = detalle.cantidad;
                            }
                        }
                    }
                    //setear maquina seleccionada dado el nmaquina
                    this.maquinaSeleccionada = this.formularioAntiguo.maquina;
                    //setear adhesivo seleccionado dado la marca
                    //setear adhesivo seleccionado dado la marca
                    if (this.formularioAntiguo.adhesivo) {
                        this.adhesivoSeleccionadoId = this.formularioAntiguo.adhesivo ? this.formularioAntiguo.adhesivo.id : null;
                        this.adhesivoSeleccionado = this.formularioAntiguo.adhesivo ? this.formularioAntiguo.adhesivo : {
                            id: 0,
                            marca: '',
                            descripcion: ''
                        };
                        this.sumaStock = this.formularioAntiguo.adhesivo ? this.formularioAntiguo.kilosAdhesivo : 0;
                        this.tipoAdhesivo = 'CSF';
                    }
                    else {
                        this.tipoAdhesivo = 'Externo';
                    }
                    this.adhesivoKilos = parseFloat(this.formularioAntiguo.kilosAdhesivo);
                    this.observaciones = this.formularioAntiguo.observaciones;
                    let servicios = this.formularioAntiguo.servicios;
                    let serviciosSolo = servicios.map(item => item.servicio);
                    this.servicioSeleccionadoCaja = serviciosSolo.filter(servicio => servicio.codigo.startsWith('100')).map(servicio => servicio.id);
                    this.serviciosSeleccionadosOtros = serviciosSolo.filter(servicio => servicio.codigo.startsWith('200')).map(servicio => servicio.id);
                    this.fechaCreacion = this.formularioAntiguo.fechaCreacion;
                    this.fechaArmado = new Date(this.formularioAntiguo.fechaArmado);
                    this.problemaAdhesivo = this.formularioAntiguo.problemaAdhesivo;
                    this.problemaMaquina = this.formularioAntiguo.problemaMaquina;
                    this.nroTroquel = this.formularioAntiguo.nroTroquel;
                    this.nroLoteAdhesivo = this.formularioAntiguo.nroLoteAdhesivo;
                    if (this.formularioAntiguo.maquinaExterna) {
                        this.tipoMaquina = 'Externa';
                    }
                    else {
                        this.tipoMaquina = 'CSF';
                    }
                    this.maquinaExterna = this.formularioAntiguo.maquinaExterna;
                    this.adhesivoExterno = this.formularioAntiguo.adhesivoExterno;
                }).catch((error) => {
                    console.error('Error al cargar el armado', error);
                });
            } catch (error) {
                console.error('Error al cargar el armado', error);
            }
        },
        async obtenerMaquinas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquinaLugar/lugar`, {
                    params: {
                        take: -1,
                        page: 1,
                        id: this.formularioAntiguo.lugarArmadoId
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinasLugar = response.data.maquinas;
                    this.maquinasLugar = this.maquinasLugar.map(maquina => maquina.maquina);
                    if (!this.problemaMaquina) {
                        this.maquinas = this.maquinasLugar;
                    }
                }).catch((error) => {
                    console.error('Error al cargar las maquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las maquinas', error);
            }
        },
        async obtenerTodasMaquinas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquina`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinasTodas = response.data;
                    //sacar maquinasLugar de maquinasTodas
                    this.maquinasTodas = this.maquinasTodas.filter(maquina => !this.maquinasLugar.some(maquinaLugar => maquinaLugar.id === maquina.id));
                    if (this.formularioAntiguo.problemaMaquina) {
                        this.maquinas = this.maquinasTodas;
                    }
                }).catch((error) => {
                    console.error('Error al cargar las máquinas todas', error);
                });
            } catch (error) {
                console.error('Error al cargar las máquinas todas', error);
            }
        },
        async obtenerTodosAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivosTodos = response.data;
                    //borrar adhesivosLugar de adhesivosTodos
                    this.adhesivosTodos = this.adhesivosTodos.filter(adhesivo => !this.adhesivosStock.some(adhesivoStock => adhesivoStock.adhesivoId === adhesivo.id));
                    if (this.formularioAntiguo.problemaAdhesivo) {
                        this.adhesivos = this.adhesivosTodos;
                    }
                }).catch((error) => {
                    console.error('Error al cargar los adhesivos todos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos todos', error);
            }
        },
        async obtenerAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let lugarArmadoId = this.formularioAntiguo.lugarArmadoId;
                await axios.get(`/adhesivosLugar/${lugarArmadoId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivosStock = response.data;
                    this.adhesivoStockLugar = response.data;
                    if (!this.formularioAntiguo.problemaAdhesivo && this.formularioAntiguo.adhesivo) {
                        let adhesivoSeleccionado = this.adhesivosStock.find(adhesivo => adhesivo.adhesivoId === this.formularioAntiguo.adhesivoId);
                        this.stockAdhesivo = adhesivoSeleccionado.kilosDisponibles;
                    }
                    //Guardar solo los items.adhesivo
                    this.adhesivos = this.adhesivosStock.map(adhesivo => adhesivo.adhesivo);

                }).catch((error) => {
                    console.error('Error al cargar los adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos', error);
            }
        },
        validarFormulario() {
            const validaciones = [
                {
                    condicion: this.cajas.cajasTotales === 0,
                    mensaje: 'Debe ingresar la cantidad de cajas totales'
                },
                {
                    condicion: this.hayError,
                    mensaje: 'La suma de mermas no coincide con mermas totales'
                },
                {
                    condicion: this.hayErrorFabricacion,
                    mensaje: 'La suma de mermas de fabricación no coincide con mermas de fabricación'
                },
                {
                    condicion: this.hayErrorPacking,
                    mensaje: 'La suma de mermas de packing no coincide con mermas de almacenaje'
                },
                {
                    condicion: this.hayErrorMaquina,
                    mensaje: 'La suma de mermas de máquina no coincide con mermas de armado'
                },
                {
                    condicion: this.maquinaSeleccionada.id === 0 && this.tipoMaquina === 'CSF',
                    mensaje: 'Debe seleccionar una máquina'
                },
                {
                    condicion: this.maquinaSeleccionada.nmaquina === '' && this.tipoMaquina === 'CSF',
                    mensaje: 'Debe seleccionar una máquina'
                },
                {
                    condicion: this.tipoMaquina === 'Externa' && this.maquinaExterna.trim() === '',
                    mensaje: 'Debe ingresar una máquina externa'
                },
                {
                    condicion: this.tipoAdhesivo === 'CSF' && this.adhesivoSeleccionado.codigo === '',
                    mensaje: 'Debe seleccionar un adhesivo'
                },
                {
                    condicion: this.observaciones.trim() === '',
                    mensaje: 'Debe ingresar una observación'
                },
                {
                    condicion: !this.validarNumero(this.adhesivoKilos),
                    mensaje: 'Debe ingresar un número válido en kilos de adhesivo'
                },
                {
                    condicion: this.tipoAdhesivo === 'CSF' && (parseFloat(this.adhesivoKilos) > (parseFloat(this.stockAdhesivo) + parseFloat(this.sumaStock))) && !this.problemaAdhesivo,
                    mensaje: 'Kilos de adhesivo no pueden ser mayores al stock'
                },
                {
                    condicion: this.tipoAdhesivo === 'Externo' && this.adhesivoExterno.trim() === '',
                    mensaje: 'Debe ingresar un adhesivo externo'
                },
                //validar detenciones de maquina
                {
                    condicion: this.detenciones.some(detencion => detencion.tipo === null),
                    mensaje: 'Debe seleccionar un tipo de detención'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.inicio === ''),
                    mensaje: 'Debe ingresar una hora de inicio'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.fin === ''),
                    mensaje: 'Debe ingresar una hora de fin'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.inicio >= detencion.fin),
                    mensaje: 'La hora de inicio debe ser menor a la hora de fin'
                },
                {
                    condicion: this.detenciones.some(detencion => detencion.observacion.trim() === ''),
                    mensaje: 'Debe ingresar una observación'
                },
                {
                    condicion: this.servicioSeleccionadoCaja.length === 0,
                    mensaje: 'Debe seleccionar al menos un servicio de caja'
                }
            ];

            for (const validacion of validaciones) {
                if (validacion.condicion) {
                    this.$notify({
                        type: 'fallo',
                        text: validacion.mensaje
                    });
                    return false;
                }
            }

            return true;
        },
        async validarNroFolio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/prestadores/validarNroFolio/${this.formularioAntiguo.lugarArmado.prestadorId}/${this.nroFolio}/${this.temporadaSeleccionada}/${this.formularioAntiguo.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 409 || response.data.status === 404 || response.data.status === 400) {
                        this.$notify({
                            type: 'fallo',
                            text: response.data.message
                        });
                        this.folioValido = false;
                    }
                    else if (response.data.valido) {
                        this.folio.id = response.data.idFolio;
                        this.folioValido = true;
                    }
                }).catch((error) => {
                    console.error('Error al validar el nro de folio', error);
                    this.$notify({
                        type: 'fallo',
                        text: 'Error al validar el nro de folio'
                    });
                });
            } catch (error) {
                console.error('Error al validar el nro de folio', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al validar el nro de folio'
                });
            }
        },
        validarNumero(numero) {
            return !isNaN(numero) && numero > 0;
        },
        // Crear array de detalle de merma para enviar al backend con el formato correcto
        crearArrayDetalle(detalleMerma) {
            const detalleMermaArray = [];
            for (const [, value] of Object.entries(detalleMerma)) {
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subValue > 0) {
                        detalleMermaArray.push({ tipo: subKey, cantidad: subValue });
                    }
                }
            }
            return detalleMermaArray;
        },
        async actualizarArmadoTodo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const armado = {
                    cajasTotales: this.cajas.cajasTotales,
                    cajasBuenas: this.cajas.cajasBuenas,
                    mermasTotales: this.mermasTotales,
                    mermasArmado: this.cajas.mermasArmado,
                    mermasFabricacion: this.cajas.mermasFabricacion,
                    mermasAlmacenaje: this.cajas.mermasAlmacenaje,
                    mermasTransporte: this.cajas.mermasTransporte,
                    noPasadasPorMaquina: this.cajas.noPasadasMaquina,
                    maquinaId: this.tipoMaquina === 'CSF' ? this.maquinaSeleccionada.id : null,
                    adhesivoId: this.adhesivoSeleccionadoId,
                    kilosAdhesivo: parseFloat(this.adhesivoKilos),
                    observaciones: this.observaciones,
                    horaInicioTurno: this.turno.horaInicio,
                    horaFinTurno: this.turno.horaFin,
                    totalHorasTurno: 0,
                    totalMinutosTurno: 0,
                    turno: this.turno.turno,
                    minutosProduccion: 0,
                    promedioCajasMinuto: 0,
                    temporadaId: this.temporadaSeleccionada,
                    folioId: this.folio.id,
                    nroFolio: this.nroFolio,
                    fechaArmado: this.fechaArmado,
                    problemaMaquina: this.tipoMaquina === 'CSF' ? this.problemaMaquina : false,
                    problemaAdhesivo: this.tipoAdhesivo === 'CSF' ? this.problemaAdhesivo : false,
                    maquinaExterna: this.tipoMaquina === 'Externa' ? this.maquinaExterna : null,
                    nroTroquel: this.nroTroquel,
                    nroLoteAdhesivo: this.nroLoteAdhesivo,
                    adhesivoExterno: this.tipoAdhesivo === 'Externo' ? this.adhesivoExterno : null,
                    lugarArmadoId: this.formularioAntiguo.lugarArmadoId,
                }
                let mermas = this.crearArrayDetalle(this.detalleMermas);
                //eliminar menuInicio y menuFin de detenciones
                this.detenciones.forEach(detencion => {
                    delete detencion.menuInicio;
                    delete detencion.menuFin;
                });
                await axios.post(`/armados/actualizar/${this.$route.params.id}`, { armado, detalleMerma: mermas, detenciones: this.detenciones }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.$notify({
                        type: 'exito',
                        text: 'Armado actualizado'
                    });
                }).catch((error) => {
                    console.error('Error al actualizar el armado', error);
                    this.$notify({
                        type: 'fallo',
                        text: 'Error al actualizar el armado'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el armado', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al actualizar el armado'
                });
            }
        },
        async guardar() {
            this.loading = true;
            try {
                if (this.validarFormulario()) {
                    await this.validarNroFolio();
                    if (!this.folioValido) {
                        return;
                    }
                    //verificar que las cajas de formularioAntiguo sean distintas a las actuales
                    await this.actualizarArmadoTodo();
                    if (this.validarServicios()) {
                        //si los servicios son distintos, actualizar
                        await this.actualizarServicios();
                    }
                    this.$router.go(-1);
                }
            } catch (error) {
                console.error('Error al guardar el armado', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al guardar el armado'
                });
            } finally {
                this.loading = false;
            }
        },
        // Validar si los servicios son distintos a los del formulario antiguo
        validarServicios() {
            let nuevosServicios = this.serviciosSeleccionadosOtros.concat(this.servicioSeleccionadoCaja);
            let serviciosAntiguos = this.formularioAntiguo.servicios.map(item => item.servicio.id)
            //validar que tengan los mismos numeros, sin importar el orden
            let cambiaron = serviciosAntiguos.length === nuevosServicios.length && serviciosAntiguos.sort().every(function (value, index) {
                return value === nuevosServicios.sort()[index]
            });
            return !cambiaron;
        },
        async actualizarServicios() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let nuevosServicios = this.serviciosSeleccionadosOtros.concat(this.servicioSeleccionadoCaja);
                await axios.post(`/armados/actualizarServicios/${this.formularioAntiguo.id}`, nuevosServicios, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.$notify({
                        type: 'exito',
                        text: 'Servicios actualizados'
                    });
                }).catch((error) => {
                    console.error('Error al actualizar los servicios', error);
                    this.$notify({
                        type: 'fallo',
                        text: 'Error al actualizar los servicios'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar los servicios', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al actualizar los servicios'
                });
            }
        },
        // Comparar cajas de formulario antiguo con las actuales
        compararCajas() {
            let cajasIguales = true;
            if (this.formularioAntiguo.cajasTotales != this.cajas.cajasTotales) {
                cajasIguales = false;
            }
            if (this.formularioAntiguo.cajasBuenas != this.cajas.cajasBuenas) {
                cajasIguales = false;
            }
            if (this.formularioAntiguo.mermasTotales != this.mermasTotales) {
                cajasIguales = false;
            }
            return cajasIguales;
        },
        async obtenerServicios() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                //si formularioAntiguo esta vacio no se obtienen los servicios
                if (this.formularioAntiguo.lugarArmadoId == null) {
                    return;
                }
                if(this.temporadaSeleccionada == null){
                    return;
                }
                await axios.get(`/servicioLugarArmado/${this.formularioAntiguo.lugarArmadoId}/${this.temporadaSeleccionada}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    let servicios = response.data;
                    //Guardar solo los servicios que tienen codigo que empieza con '100' en serviciosCaja
                    this.serviciosCaja = servicios.filter(servicio => servicio.codigo.startsWith('100'));
                    //Guardar solo los servicios que tienen codigo que empieza con '200' en serviciosOtros
                    this.serviciosOtros = servicios.filter(servicio => servicio.codigo.startsWith('200'));
                }).catch((error) => {
                    console.error('Error al obtener los servicios', error);
                    this.$notify({
                        type: 'fallo',
                        text: 'Error al obtener los servicios'
                    });
                });
            } catch (error) {
                console.error('Error al obtener los servicios', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al obtener los servicios'
                });
            }
        }
    }
}
</script>

<style>
.cartas {
    border-radius: 20px;
    margin-top: 30px;
    padding: 20px;
}

.motivo-rechazo {
    border-radius: 20px;
    margin-top: 30px;
    padding: 20px;
    background-color: #FFD54F;
}

.no-editable {
    -webkit-text-fill-color: black;
    font-weight: bold;
}
</style>