const { SlashCommandBuilder, Client, Events } = require("@discordjs/builders");
const fetch = require("node-fetch");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} = require("discord.js");

function convert_to_float(a) {
         
          // Type conversion
          // of string to float
          var floatValue = +(a);
           
          // Return float value
          return floatValue;
      }

module.exports = {
  data: new SlashCommandBuilder()
    .setName("best")
    .setDMPermission(true)
    .setDescription("Search for the least occupied parking lot in Ghent.")
    .addIntegerOption((option) =>
      option
        .setName("start")
        .setDescription(
          "Add a number greater than 0 to give other options if the 1st one doesn't suit you."
        )
        .setRequired(false)),
  async execute(interaction, client) {
    await interaction.deferReply();

      let start;
      if (interaction.options.getInteger("start") == null){
        start = 0;
      }else{
        start = interaction.options.getInteger("start");
      }

    fetch(
      "https://data.stad.gent/api/records/1.0/search/?dataset=bezetting-parkeergarages-real-time&q=&lang=en&rows=1&start=" + start + "&sort=-occupation"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error || data.errorMessage || data.records[0] == null) {
          console.log("The following error occurred: " + data.errorMessage);
          let errorEmbed = new EmbedBuilder()
          .setTitle("Nothing was found!")

          return interaction.editReply({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }

        let openState;
        if (data.records[0].fields.isopennow == 1){
          openState = "✅"
        }else{
          openState = "❌"
        }

        let freePark;
        if (data.records[0].fields.freeparking == 1){
          freePark = "✅"
        }else{
          freePark = "❌"
        }

        let OccupyVal;
        switch (true){
          case data.records[0].fields.occupation < 25:
            OccupyVal = "#5bcc39" //green
            break;
          case data.records[0].fields.occupation > 25 && data.records[0].fields.occupation < 50:
            OccupyVal = "#cc8339" //orange
            break;
          case data.records[0].fields.occupation > 50:
            OccupyVal = "#cc3939" //red
            break;
          default:
            OccupyVal = "#FFFFFF"
            break;
        }

        let timeOnly = data.records[0].fields.lastupdate.split("T")[1].split("+")[0]

        let parkingEmbed = new EmbedBuilder() 
        .setTitle("Here's the best spot!")
        .setURL(data.records[0].fields.urllinkaddress)
        .setDescription(data.records[0].fields.operatorinformation + " | " + data.records[0].fields.name)
        .setColor(OccupyVal)
        .addFields({
          name:"Is open?",
          value: openState
        })
        .addFields({
          name: "Amount of place:",
          value: data.records[0].fields.availablecapacity  + " spot(s) left"
        })
        .addFields({
          name: "Free parking?",
          value: freePark
        })
        .setFooter({
          text: "Last updated at: " + timeOnly
        })

        return interaction.editReply({ embeds: [parkingEmbed] });
      }); 
    },
};
