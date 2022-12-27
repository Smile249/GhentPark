const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: {
    name: 'prsearch',
    dmPermission: true,
    description: 'Search for a public parking place/P+R in zone Ghent with a query.',
    options: {
      query: {
        type: 'string',
        description: 'Enter the name of the place.',
        required: true,
      },
    },
  },
  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.get('query');
    const apiUrl = `https://data.stad.gent/api/records/1.0/search/?dataset=locaties-openbare-parkings-gent&q=${query}&lang=en&rows=1&sort=`;
    const data = await fetch(apiUrl).then((res) => res.json());

    if (data.error || data.errorMessage || !data.records[0]) {
      console.log(`The following error occurred: ${data.errorMessage}`);
      const errorEmbed = new EmbedBuilder()
        .setTitle('Nothing was found!')
        .setColor('#FF0000');
      return interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    const freeParking = data.records[0].fields.naam === 'Galveston' ||
      data.records[0].fields.naam === 'Sint-Pietersstation' ||
      data.records[0].fields.naam === 'Ledeberg'
      ? '❌'
      : data.records[0].fields.naam === 'Gent Sint-Pieters' ||
        data.records[0].fields.naam === 'Dampoort'
        ? '🟧 Free bicycle parking, car parking paid'
        : '✅';

    const parkingEmbed = new EmbedBuilder()
      .setTitle(`Results for: ${query}`)
      .setURL(data.records[0].fields.url)
      .setDescription(`${data.records[0].fields.type} | ${data.records[0].fields.naam}`)
      .setColor('#FFA500')
      .addFields({
        name: 'Capacity:',
        value: JSON.stringify(data.records[0].fields.capaciteit),
      })
      .addFields({
        name: 'Free parking?',
        value: freeParking,
      });

    return interaction.editReply({ embeds: [parkingEmbed] });
  },
};
