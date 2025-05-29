import * as VueRouter from 'vue-router';
const routes = [
    { path: '/', component: () => import('../views/LoginPage.vue'), meta: { requiresAuth: false } },
    { path: '/usuarios', component: () => import('../views/mantenedores/csf/MantenedorUsuarios.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/formularioArmado', name: 'FormularioArmado', component: () => import('../views/formularios/FormularioArmado.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/prestadores', component: () => import('../views/mantenedores/csf/MantenedorPrestadores.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "revisor csf", "gestor de adhesivo"] } },
    { path: '/folios/:id/:nombre', component: () => import('../views/mantenedores/csf/MantenedorFolios.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "revisor csf"] } },
    { path: '/misFolios', component: () => import('../views/mantenedores/prestadores/MantenedorFolios.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/temporadas', component: () => import('../views/mantenedores/csf/MantenedorTemporadas.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/zonas', component: () => import('../views/mantenedores/csf/MantenedorZonas.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/logs', component: () => import('../views/mantenedores/csf/MantenedorLogs.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/lugaresArmado', component: () => import('../views/mantenedores/csf/MantenedorLugaresArmado.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/miembros/:id/:nombre', component: () => import('../views/mantenedores/csf/MiembrosPrestador.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "revisor csf"] } },
    { path: '/servicios', component: () => import('../views/mantenedores/csf/MantenedorServicios.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/adhesivos', component: () => import('../views/mantenedores/csf/MantenedorAdhesivos.vue'), meta: { requiresAuth: true, roles: ["admin"] } },
    { path: '/adhesivosPrestador/:id/:nombre', component: () => import('../views/mantenedores/csf/MantenedorAdhesivosPrestador.vue'), meta: { requiresAuth: true, roles: ["admin", "gestor de adhesivo"] } },
    { path: '/adhesivosLugar/:id/:nombre', component: () => import('../views/mantenedores/prestadores/MantenedorAdhesivosLugar.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/adhesivoPrestadorKardex', component: () => import('../views/stock/AdhesivoPrestadorKardex.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "gestor de adhesivo"] } },
    { path: '/adhesivoLugarKardex', component: () => import('../views/stock/AdhesivoLugarKardex.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "gestor de adhesivo"] } },
    { path: '/serviciosPrestador/:id/:nombre', component: () => import('../views/mantenedores/csf/MantenedorServiciosPrestador.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "revisor csf"] } },
    { path: '/precioServiciosLugar/:id/:nombre', component: () => import('../views/mantenedores/csf/MantenedorServiciosPrecios.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/recibirClienteAnt', component: () => import('../views/recibir/RecibirClienteAnt.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/recibirCsfAnt', component: () => import('../views/recibir/RecibirCsfAnt.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/recibirNv', component: () => import('../views/recibir/RecibirNv.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    //{ path: '/recibirStockCsf', component: () => import('../views/recibir/RecibirStockCsf.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/recibirExterno', component: () => import('../views/recibir/RecibirExterno.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/ajustarPositivo', component: () => import('../views/ajustar/AjustePositivo.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/ajustarNegativo', component: () => import('../views/ajustar/AjusteNegativo.vue'), meta: { requiresAuth: true, roles: ["operador logistico"] } },
    { path: '/armarAnt', component: () => import('../views/armar/ArmarAnticipado.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/armarNv', component: () => import('../views/armar/ArmarNv.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    //{ path: '/armarStockCsf', component: () => import('../views/armar/ArmarStockCsf.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/armarExterno', component: () => import('../views/armar/ArmarExterno.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/armadosPrestador', component: () => import('../views/armados/ArmadosPrestador.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/preliquidar', component: () => import('../views/armados/PreliquidarFormularios.vue'), meta: { requiresAuth: true, roles: ["revisor superior", "revisor csf"] } },
    { path: '/formularios', component: () => import('../views/armados/ArmadosTotal.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "revisor csf"] } },
    // { path: '/formularioBorrador/:id', component: () => import('../views/formularios/FormularioBorrador.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/formularioBorrador/:id', component: () => import('../views/formularios/FormularioBorradorV2.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/formularioAprobado/:id', component: () => import('../views/formularios/FormularioAprobadoV2.vue'), meta: { requiresAuth: true, roles: ["revisor csf", "revisor superior"] } },
    // { path: '/formularioPreliquidado/:id', component: () => import('../views/formularios/FormularioPreliquidado.vue'), meta: { requiresAuth: true, roles: ["revisor csf", "revisor superior"] } },
    { path: '/formularioPreliquidado/:id', component: () => import('../views/formularios/FormularioPreliquidadoV2.vue'), meta: { requiresAuth: true, roles: ["revisor csf", "revisor superior"] } },
    { path: '/formularioV2', component: () => import('../views/formularios/FormularioSinStock.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/crearFormulario', component: () => import('../views/armar/ArmarV2.vue'), meta: { requiresAuth: true, roles: ["digitador"] } },
    { path: '/liquidaciones', component: () => import('../views/liquidaciones/LiquidacionesHechas.vue'), meta: { requiresAuth: true, roles: ["revisor superior", "revisor csf", "admin"] } },
    { path: '/liquidacion/:id/:nombre', component: () => import('../views/liquidaciones/EditarLiquidacion.vue'), meta: { requiresAuth: true, roles: ["revisor superior", "revisor csf"] } },
    { path: '/misLiquidaciones', component: () => import('../views/liquidaciones/LiquidacionesPrestador.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/armadoSaldo', component: () => import('../views/stock/ArmadoSaldo.vue'), meta: { requiresAuth: true, roles: ["admin"] } },
    { path: '/armadoKardex', component: () => import('../views/stock/ArmadoKardex.vue'), meta: { requiresAuth: true, roles: ["admin"] } },
    { path: '/requisSaldo', component: () => import('../views/stock/RequisSaldo.vue'), meta: { requiresAuth: true, roles: ["admin"] } },
    { path: '/tipoDetenciones', component: () => import('../views/mantenedores/csf/MantenedorTipoDetencion.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior"] } },
    { path: '/maquinas', component: () => import('../views/mantenedores/csf/MantenedorMaquinas.vue'), meta: { requiresAuth: true, roles: ["admin", "operador logistico"] } },
    { path: '/maquinasKardex', component: () => import('../views/stock/MaquinaKardex.vue'), meta: { requiresAuth: true, roles: ["admin", "revisor superior", "operador logistico"] } },
    { path: '/lugaresPrestador', component: () => import('../views/mantenedores/prestadores/MantenedorLugaresPrestador.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: '/misServicios', component: () => import('../views/mantenedores/prestadores/ServiciosPrestador.vue'), meta: { requiresAuth: true, roles: ["prestador"] } },
    { path: "/recuperar", component: () => import('../views/RecuperarContrasenia.vue') },
    { path: "/cambiar/:token", component: () => import('../views/CambiarContrasenia.vue') },
    { path: "/requis", component: () => import('../views/mantenedores/csf/CambiarRequis.vue'), meta: { requiresAuth: true, roles: ["admin", "gestor de armado"] } },
    { path: "/errorPage", component: () => import('../views/ErrorPage.vue') },
    { path: "/:pathMatch(.*)*", component: () => import('../views/ErrorPage.vue') },
];

export const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    let isAuthenticated = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const rol = isAuthenticated ? JSON.parse(isAuthenticated).rol : null;
    const rolMomentaneo = isAuthenticated ? JSON.parse(isAuthenticated).rolMomentaneo : null;

    // Verificar que el token no haya expirado
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (Date.now() >= payload.exp * 1000) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            isAuthenticated = false;
        }
    }

    // Borrar el item de localStorage si la ruta no es /formularioArmado
    if (!to.path.startsWith('/formularioArmado') && !to.path.startsWith('/formularioV2')) {
        if (!to.path.startsWith('/formularioArmado')) {
            localStorage.removeItem('item');
            localStorage.removeItem('tipo');
        }
        localStorage.removeItem('lugarArmado');
    }
    // Si requiere autenticación pero no está autenticado, redirigir al login
    if (to.meta.requiresAuth && !isAuthenticated) {
        next("/");
    } else if (isAuthenticated && to.path === "/") {
        // Redirigir según el rol principal al acceder a la raíz
        if (rol === "admin") {
            next("/usuarios");
        } else if (rol === "revisor superior" || rol === "revisor csf") {
            next("/prestadores");
        } else if (rol === "digitador") {
            next("/crearFormulario");
        } else if (rol === "operador logistico") {
            next("/recibirCsfAnt");
        }
    } else if (to.meta.roles) {
        // Validar si el rol principal o rol temporal permite el acceso
        const hasAccess =
            to.meta.roles.includes(rol) ||
            (rolMomentaneo &&
                rolMomentaneo.some(
                    (tempRol) =>
                        to.meta.roles.includes(tempRol.rol) &&
                        new Date(tempRol.fechaInicio) <= new Date() &&
                        new Date(tempRol.fechaFin) >= new Date()
                )
            );

        if (!hasAccess) {
            next("/");
        } else {
            next();
        }
    } else {
        next();
    }
});
