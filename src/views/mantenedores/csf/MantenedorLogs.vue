<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 1%; margin-bottom: 1%; margin-right: 1%; border-radius: 20px;">
                <TablaLogs />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaLogs from '@/components/tablas/TablaLogs.vue';
export default {
    components: {
        DrawerMenu, TablaLogs
    }
}
</script>

<style></style>