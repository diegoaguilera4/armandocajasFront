<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <TablaHehistor />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaHehistor from '@/components/tablas/TablaHehistor.vue';

export default {
    components: {
        DrawerMenu, TablaHehistor
    },
    data: () => ({
    }),
    methods: {
    }
}
</script>

<style></style>