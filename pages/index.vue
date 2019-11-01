<template>
  <div class="container">
    <p>Projects</p>
    <div v-if="projects.length !== 0" class="blog-main">
      <!-- Template for blog projects -->
      <section v-for="project in projects" :key="project.id" v-bind:project="project" class="project">
        <nuxt-link :to="`/projects/${project.uid}`">{{ $prismic.richTextAsPlain(project.data.title) }} </nuxt-link>
        <img :src="project.data.thumbnail.url" alt="">
        <p>{{ $prismic.richTextAsPlain(project.data.promo_text) }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import Prismic from "prismic-javascript"
import PrismicConfig from "~/prismic.config.js"

export default {
  components: {
  },
  async asyncData({context, error, req}) {
    try{
      // Query to get API object
      const api = await Prismic.getApi(PrismicConfig.apiEndpoint, {req})

      // Load the edit button
      if (process.client) window.prismic.setupEditButton()

      const projects = await api.query(
        Prismic.Predicates.at("document.type", "projects")
      )

      return {
        projects: projects.results,
      }

      // Returns data to be used in template
    } catch (e) {
      // Returns error page
      error({ statusCode: 404, message: 'Page not found' })
    }
  }
}
</script>

<style scoped>
  .container {
    width: 960px;
    margin: 0 auto;
  }
</style>