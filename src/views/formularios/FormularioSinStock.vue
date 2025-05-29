<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-container>
                <template v-if="loading">
                    <v-card style="background-color: surface; border-radius: 20px; margin-top: -40px">
                        <v-row align="center">
                            <v-col cols="12" md="4" sm="4">
                                <v-img src="../../assets/csf.png" height="45px"
                                    style="margin-top: 20px; margin-bottom: 20px;"></v-img>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-title>INFORME DE ARMADO</v-card-title>
                            </v-col>
                            <v-col cols="12" md="4" sm="4" class="d-flex justify-center">
                                <v-card-text>
                                    {{ usuario.nombre }} - {{ usuario.rol }}
                                </v-card-text>
                                <v-card-text>
                                    {{ usuario.lugar }} - {{ usuario.empresa }}
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
                            <v-col cols="6" lg="2" md="3" sm="4">
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
                        </v-row>
                        <v-row justify="center">
                            <v-switch v-model="tipoProducto" color="primary" :label="`Producto ${tipoProducto}`"
                                false-value="CSF" true-value="Externo" hide-details></v-switch>
                        </v-row>
                        <v-row v-if="tipoProducto === 'CSF'" justify="center" style="margin-top: 20px;">
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.NUMREQ" label="NV" variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.CODITE" label="Código" variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.RUTCLI" label="RUT Cliente"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.NOMBREI" label="Nombre cliente"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.DESCRI" label="Descripción"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col lg="1">
                                <v-tooltip text="Validar producto" location="top">
                                    <template v-slot:activator="{ props }">
                                        <v-btn icon v-bind="props" @click="validarProducto()" color="primary">
                                            <v-icon>mdi-help-circle-outline</v-icon></v-btn>
                                    </template>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                        <v-row v-else justify="center" style="margin-top: 20px;">
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="fabricanteExterno" label="Fabricante"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.NOMBREI" label="Nombre cliente"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                            <v-col cols="6" lg="2" md="2" sm="3">
                                <v-text-field v-model="data.DESCRI" label="Descripción"
                                    variant="solo-filled"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row v-if="posibleProducto" justify="center" style="margin-top: 20px; margin-bottom: 20px;">
                            <v-alert icon="mdi-message-alert" title="" :text="mensajePosible" color="#FFECB3"></v-alert>
                        </v-row>
                    </v-card>

                    <v-card class="cartas">
                        <v-card-title class="d-flex justify-center">
                            RESUMEN GENERAL CAJAS
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
                                <v-text-field v-model="mermasTotales" bg-color="grey" class="no-editable"
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
                                    inset variant="solo-filled">
                                </v-number-input>
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
                                cajas.mermasFabricacion - sumaFabricacion }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input rounded="xl" :bg-color="colorErrorFabricacion"
                                    v-model="detalleMermas.fabricacion.impresion" :reverse="false"
                                    :max="cajas.mermasFabricacion
                                        - this.detalleMermas.fabricacion.troquel - this.detalleMermas.fabricacion.laminado
                                        - this.detalleMermas.fabricacion.recorte - this.detalleMermas.fabricacion.rayado" :min="0" controlVariant="split" label="Impresion"
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
                                cajas.mermasAlmacenaje - sumaPacking }}
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
                                cajas.mermasTransporte - sumaTransporte }}
                        </p>
                        <v-row justify="center" style="margin-top: 10px;">
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.amarre" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Amarre" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.paletizaje" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.amarre - detalleMermas.transporte.enzunchado - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Paletizaje" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.enzunchado" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.amarre - detalleMermas.transporte.stretchFilm - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Enzunchado" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
                                    v-model="detalleMermas.transporte.stretchFilm" :reverse="false"
                                    :max="cajas.mermasTransporte - detalleMermas.transporte.paletizaje - detalleMermas.transporte.enzunchado - detalleMermas.transporte.amarre - detalleMermas.transporte.proteccion"
                                    :min="0" controlVariant="split" label="Stretch Film" :hideInput="false" inset
                                    variant="solo-filled"></v-number-input>
                            </v-col>
                            <v-col cols="12" lg="2" md="4" sm="4">
                                <v-number-input :bg-color="colorErrorTransporte" rounded="xl"
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
                        <v-btn color="error" @click="$router.go(-1)">Cancelar</v-btn>
                        <v-btn color="primary" style="margin-left: 10px;" @click="crearForm()">Guardar</v-btn>
                    </v-row>
                    <v-dialog v-model="dialogVerificar" max-width="550px">
                        <v-card style="border-radius: 20px; padding: 10px;">
                            <v-card-title class="text-center d-flex flex-column">
                                <span class="text-h6 text-wrap">
                                    Producto no encontrado, ¿No estás tratando de ingresar un producto externo?
                                </span>
                            </v-card-title>
                            <v-card-text class="text-center font-weight-bold">
                                Si no es así, por favor verifica el código del producto y vuelve a intentarlo.
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="error" variant="elevated"
                                    @click="dialogVerificar = false; intentosVerificar = 0">Cancelar</v-btn>
                                <v-btn color="primary" variant="elevated" @click="esProductoExterno()">Sí, es
                                    externo</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </template>
            </v-container>
        </v-main>
    </v-app>

</template>

<script>
import DetencionesMaquina from '@/components/formularios/DetencionesMaquina.vue';
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import ObservacionesForm from '@/components/formularios/ObservacionesForm.vue';
import TiempoProduccion from '@/components/formularios/TiempoProduccion.vue';
import axios from 'axios';
import { ref } from 'vue';
import MaquinaAdhesivoTroquel from '@/components/formularios/MaquinaAdhesivoTroquel.vue';
export default {
    name: 'FormularioArmado',
    components: {
        DrawerMenu,
        DetencionesMaquina,
        TiempoProduccion,
        ObservacionesForm,
        MaquinaAdhesivoTroquel
    },
    data() {
        return {
            inicio: null,
            fin: null,
            menuInicio: false,
            menuFin: false,
            data: {},
            loading: true,
            nroFolio: null,
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
            adhesivoSeleccionadoId: null,
            adhesivoSeleccionado: {
                id: 0,
                codigo: '',
                descripcion: '',
                descripcion2: ''
            },
            nroTroquel: null,
            stockAdhesivo: null,
            adhesivoKilos: null,
            adhesivos: [],
            observaciones: '',
            fechaArmado: ref(new Date()),
            fechaCreacion: new Date(),
            rules: [v => v.length <= 400 || 'Máximo 400 caracteres'],
            tipo: '',
            prestadorId: 0,
            folioDisponible: false,
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
            lugarArmadoId: 0,
            adhesivosStock: [],
            maquinasTodas: [],
            adhesivosTodos: [],
            adhesivoStockLugar: [],
            maquinasLugar: [],
            dialogAdhesivo: false,
            dialogMaquina: false,
            problemaMaquina: false,
            problemaAdhesivo: false,
            tipoMaquina: 'CSF',
            tipoProducto: 'CSF',
            tipoAdhesivo: 'CSF',
            maquinaExterna: '',
            lugares: [],
            idLugarArmado: null,
            fabricanteExterno: '',
            nroLoteAdhesivo: '',
            intentosVerificar: 0,
            dialogVerificar: false,
            adhesivoExterno: '',
            posibleProducto: false,
            mensajePosible: '',
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
        intentosVerificar(newVal) {
            if (newVal >= 3) {
                this.dialogVerificar = true;
            }
        },
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
        tipoProducto() {
            //Reiniciar variables cuando cambia el tipo de producto
            this.data.NUMREQ = '';
            this.data.CODITE = '';
            this.data.RUTCLI = '';
            this.data.NOMBREI = '';
            this.data.DESCRI = '';
        },
        adhesivoSeleccionadoId(newVal) {
            //seter adhesivoSeleccionado
            if (this.adhesivoSeleccionadoId) {
                this.adhesivoSeleccionado = this.adhesivos.find(adhesivo => adhesivo.id === newVal);
                //guardar stock de ese adhesivo
                let adhesivo = this.adhesivosStock.find(adhesivo => adhesivo.adhesivoId === newVal);
                if (!this.problemaAdhesivo) {
                    this.stockAdhesivo = adhesivo.kilosDisponibles;
                }
            }
            else {
                this.adhesivoSeleccionado = {
                    id: 0,
                    codigo: '',
                    descripcion: '',
                    descripcion2: ''
                }
                this.stockAdhesivo = null;
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
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no está correcta';
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
                this.mensajeErrorFabricacion = '**La suma de mermas de fabricación no cestá correcta';
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
                this.mensajeErrorPacking = '**La suma de mermas de almacenaje no está correcta';
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
                this.mensajeErrorPacking = '**La suma de mermas de almacenaje no está correcta';
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
                this.mensajeErrorMaquina = '**La suma de mermas de armado no está correcta';
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
                this.mensajeErrorMaquina = '**La suma de mermas de armado no está correcta';
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
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no está correcta';
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
                this.mensajeErrorTransporte = '**La suma de mermas de transporte no está correcta';
            }
            else {
                this.colorErrorTransporte = '#C8E6C9';
                this.hayErrorTransporte = false;
                this.mensajeErrorTransporte = '';
            }
        },
    },
    async created() {
        const user = JSON.parse(localStorage.getItem('user'));
        //Verificar si existe idLugarArmado en localstorage
        if (localStorage.getItem('lugarArmado')) {
            const lugar = JSON.parse(localStorage.getItem('lugarArmado'));
            this.lugarArmadoId = lugar.id;
            this.usuario.lugar = lugar.nombre;
        }
        else {
            this.$router.push('/crearFormulario');
        }
        await this.obtenerMaquinas();
        await this.obtenerTodasMaquinas();
        await this.obtenerAdhesivos();
        await this.obtenerTodosAdhesivos();
        await this.obtenerDetenciones();
        this.usuario.empresa = user.prestador[0].prestador.nombre;
        this.prestadorId = user.prestador[0].prestadorId;
        await this.obtenerLugares();
        this.usuario.nombre = user.nombre;
        this.usuario.correo = user.correo;
        this.usuario.rol = user.rol;
    },
    methods: {
        esProductoExterno() {
            this.dialogVerificar = false;
            this.intentosVerificar = 0;
            this.tipoProducto = 'Externo';
        },
        async validarProducto() {
            if ((!this.data.CODITE || this.data.CODITE.trim() === '') && (!this.data.NUMREQ || this.data.NUMREQ.trim() === '')) {
                this.posibleProducto = false;
                this.mensajePosible = '';
                this.$notify({
                    type: 'fallo',
                    text: 'Código y NV no pueden estar vacíos',
                });
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            await axios.get(`/armados/validarProducto`, {
                params: {
                    codigo: this.data.CODITE,
                    nv: this.data.NUMREQ
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                if (response.data.status !== 404) {
                    if (response.data.producto) {
                        this.posibleProducto = false;
                        this.mensajePosible = '';
                        this.data.RUTCLI = response.data.producto.RUT;
                        this.data.NOMBREI = response.data.producto.NOMBREI;
                        this.data.DESCRI = response.data.producto.DESCRI;
                        this.$notify({
                            type: 'exito',
                            text: 'Producto encontrado',
                        });
                    }
                    else if (response.data.nvs) {
                        this.posibleProducto = true;
                        this.mensajePosible = response.data.nvs;
                    }
                    else if (response.data.codigos) {
                        this.posibleProducto = true;
                        this.mensajePosible = response.data.codigos;
                    }
                    else {
                        this.posibleProducto = false;
                        this.mensajePosible = '';
                        console.error('Producto no válido', response.data);
                        this.intentosVerificar += 1;
                        this.$notify({
                            type: 'fallo',
                            text: 'Producto no encontrado',
                        });
                    }
                }
                else {
                    this.posibleProducto = false;
                    this.mensajePosible = '';
                    console.error('Producto no válido', response.data);
                    this.intentosVerificar += 1;
                    this.$notify({
                        type: 'fallo',
                        text: 'Producto no encontrado',
                    });
                }
            }).catch(error => {
                this.posibleProducto = false;
                this.mensajePosible = '';
                this.intentosVerificar += 1;
                console.error('Error al validar producto', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al validar producto',
                });
            });
        },
        async obtenerLugares() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            await axios.get(`/lugarArmados/prestador`, {
                params: {
                    prestadorId: this.prestadorId,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                this.lugares = response.data;
            }).catch(error => {
                console.error('Error al cargar los lugares', error);
            });
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
                        id: this.lugarArmadoId
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinasLugar = response.data.maquinas;
                    this.maquinasLugar = this.maquinasLugar.map(maquina => maquina.maquina);
                    this.maquinas = this.maquinasLugar;
                }).catch((error) => {
                    console.error('Error al cargar las máquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las máquinas', error);
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
                }).catch((error) => {
                    console.error('Error al cargar las máquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las máquinas', error);
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
                }).catch((error) => {
                    console.error('Error al cargar los adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos', error);
            }
        },
        async obtenerAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivosLugar/${this.lugarArmadoId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivosStock = response.data;
                    this.adhesivoStockLugar = response.data;
                    //Guaradar solo los items.adhesivo
                    this.adhesivos = this.adhesivosStock.map(adhesivo => adhesivo.adhesivo);
                }).catch((error) => {
                    console.error('Error al cargar los adhesivos', error);
                });
            } catch (error) {
                console.error('Error al cargar los adhesivos', error);
            }
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
        async crearArmado() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            const usuario = JSON.parse(localStorage.getItem('user'));
            const armado = {
                nroFolio: this.nroFolio,
                folioId: parseInt(this.folio.id),
                nv: this.tipoProducto === "CSF" ? this.data.NUMREQ : this.fabricanteExterno,
                codCsf: this.tipoProducto === "CSF" ? this.data.CODITE : this.fabricanteExterno,
                rutCliente: this.data.RUTCLI,
                guiaCsf: this.data.GUIA_CSF,
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
                observaciones: this.observaciones,
                fechaArmado: this.fechaArmado,
                fechaCreacion: this.fechaCreacion,
                lugarArmadoId: this.lugarArmadoId,
                prestadorId: this.prestadorId,
                usuarioId: usuario.id,
                kilosAdhesivo: parseFloat(this.adhesivoKilos),
                horaInicioTurno: this.turno.horaInicio,
                horaFinTurno: this.turno.horaFin,
                totalHorasTurno: 0,
                totalMinutosTurno: 0,
                turno: this.turno.turno,
                minutosProduccion: 0,
                promedioCajasMinuto: 0,
                temporadaId: this.temporadaSeleccionada,
                problemaAdhesivo: this.problemaAdhesivo,
                problemaMaquina: this.problemaMaquina,
                maquinaExterna: this.tipoMaquina === 'Externa' ? this.maquinaExterna : null,
                esExterno: this.tipoProducto === 'Externo',
                nroTroquel: this.nroTroquel,
                nombreCliente: this.data.NOMBREI,
                descripcion: this.data.DESCRI,
                nombreExterno: this.tipoProducto === 'Externo' ? this.fabricanteExterno : null,
                nroLoteAdhesivo: this.nroLoteAdhesivo ? this.nroLoteAdhesivo : null,
                adhesivoExterno: this.tipoAdhesivo === 'Externo' ? this.adhesivoExterno : null,
            };
            let mermas = this.crearArrayDetalle(this.detalleMermas);

            //borrar menuInicio y menuFin de detenciones
            this.detenciones.forEach(detencion => {
                delete detencion.menuInicio;
                delete detencion.menuFin;
            });
            await axios.post(`/armados`, { armado: armado, detalleMerma: mermas, detenciones: this.detenciones }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(async (response) => {
                if (response.data.message) {
                    this.$notify({
                        type: 'fallo',
                        text: response.data.message
                    });
                    return;
                }
                this.$notify({
                    type: 'exito',
                    text: 'Formulario creado correctamente'
                });
                this.loading = false;
                this.$router.go(-1);
            }).catch((error) => {
                this.$notify({
                    type: 'fallo',
                    text: error.response.data.message
                });
            });
        },
        async crearForm() {
            this.loading = true;
            try {
                if (!this.validarFormulario()) {
                    return;
                }
                await this.crearArmado(this.armadoKardexId);

            } catch (error) {
                console.error('Error al crear el formulario', error);
                this.$notify({
                    type: 'fallo',
                    text: 'Error al crear el formulario'
                });
            }

        },
        validarFormulario() {
            const validaciones = [
                {
                    condicion: this.tipoProducto === 'Externo' && this.fabricanteExterno.trim() === '',
                    mensaje: 'Debe ingresar un fabricante externo'
                },
                {
                    condicion: this.nroFolio === null || this.nroFolio === '' || this.nroFolio === 0,
                    mensaje: 'Debe ingresar un número de folio'
                },
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
                    condicion: this.tipoAdhesivo === 'CSF' && (parseFloat(this.adhesivoKilos) > parseFloat(this.stockAdhesivo) && !this.problemaAdhesivo),
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
                    condicion: this.turno.horaInicio === '',
                    mensaje: 'Debe ingresar una hora de inicio de turno'
                },
                {
                    condicion: this.turno.horaFin === '',
                    mensaje: 'Debe ingresar una hora de fin de turno'
                },
                {
                    condicion: !this.turno.turno,
                    mensaje: 'Debe seleccionar un turno'
                }


            ];
            let hayError = false;
            for (const validacion of validaciones) {
                if (validacion.condicion) {
                    this.$notify({
                        type: 'fallo',
                        text: validacion.mensaje
                    });
                    hayError = true;
                }
            }
            if (hayError) {
                return false;
            }

            return true;
        },
        validarNumero(numero) {
            return !isNaN(numero) && numero > 0;
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

.no-editable {
    -webkit-text-fill-color: black;
    font-weight: bold;
}
</style>