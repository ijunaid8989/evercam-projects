<template>
  <div>
    <div class="outer-container">
      <div class="back">
        <nuxt-link to="../">back to list</nuxt-link>
      </div>
      <div class="container">

        <table class="tg">
          <tr>
            <th class="tg-cly1">Title:</th>
            <th class="tg-0lax">{{ $prismic.richTextAsPlain(title) }}</th>
          </tr>
          <tr>
            <td class="tg-0lax">Banner:</td>
            <td class="tg-0lax"><img :src="banner.url" alt=""></td>
          </tr>
          <tr>
            <td class="tg-0lax">Details:</td>
            <td class="tg-0lax">{{getFirstParagraph(details)}}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Small Banner:</td>
            <td class="tg-0lax"><img :src="small_banner.url" alt=""></td>
          </tr>
          <tr>
            <td class="tg-0lax">Published:</td>
            <td class="tg-0lax">{{formattedDate}}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Location:</td>
            <td class="tg-0lax">
              <gmap-map :center="center" :zoom="10" style="width: 100%; height: 200px">
                <gmap-marker :position="center"></gmap-marker>
              </gmap-map>
            </td>
          </tr>
          <tr v-if="fields.length !== 0" v-for="role in fields" :key="role.id" v-bind:role="role">
            <td class="tg-0lax">{{ getRoleType(role.type) }}</td>
            <td class="tg-0lax">{{ $prismic.richTextAsPlain(role.data.title) }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Prismic from "prismic-javascript"
import PrismicConfig from "~/prismic.config.js"

export default {
  name: 'project',
  async asyncData({ params, error, req }) {
    try{
      // Query to get API object
      const api = await Prismic.getApi(PrismicConfig.apiEndpoint, {req})

      // Query to get post content
      const project = await api.getByUID("projects", params.uid, { pageSize : 100, fetchLinks: 'fields.role.name'})

      let rolesArray = []

      project.data.fields.forEach(function(role) {
        rolesArray.push(role.role.id)
      });

      const rolesData = await api.getByIDs(rolesArray, { pageSize : 100 })


      // Load the edit button
      if (process.client) window.prismic.setupEditButton()

      // Returns data to be used in template
      return {
        banner: project.data.banner,
        title: project.data.title,
        fields: rolesData.results,
        small_banner: project.data.small_banner,
        details: project.data.details,
        location: project.data.location,
        formattedDate: Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(project.last_publication_date)),
        center: {
          lat: project.data.location.latitude,
          lng: project.data.location.longitude
        }
      }
    } catch (e) {
      // Returns error page
      error({ statusCode: 404, message: 'Page not found' })
    }
  },
  methods: {
    getFirstParagraph (details) {
      const textLimit = 10000;
      const slices = details;
      let firstParagraph = '';
      let haveFirstParagraph = false;

      slices.map(function(slice) {
        if (!haveFirstParagraph && slice.type == "paragraph") {
          firstParagraph += slice.text;
          haveFirstParagraph = false;
        }
      });
      
      const limitedText = firstParagraph.substr(0, textLimit)

      if (firstParagraph.length > textLimit) {
        return limitedText.substr(0, limitedText.lastIndexOf(' ')) + '...';
      }
      else {
        return firstParagraph;
      }
    },

    getRoleType (type) {
      if (type.includes("_")) {
        let splitType = type.split('_')
        return `${this.capitalizeFirstLetter(splitType[0])} ${this.capitalizeFirstLetter(splitType[1])}`
      } else {
        return this.capitalizeFirstLetter(type)
      }
    },

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

}
</script>

<style scoped>
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg .tg-cly1{text-align:left;vertical-align:middle;}
.tg .tg-0lax{text-align:left;vertical-align:top;}
.container { width: 960px; margin: 0 auto;}
</style>