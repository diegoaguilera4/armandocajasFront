<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <TablaPreliquidar/>
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaPreliquidar from '@/components/tablas/liquidacion/TablaPreliquidar.vue';
export default {
    components: {
        DrawerMenu, TablaPreliquidar
    },
    data: () => ({

    }),
}
</script>

<style></style>