SWAM.Views.StatusTimeChart = SWAM.View.extend({
    defaults: {
      classes: "status-timeline",
    },

    on_init: function() {

    },

    convertEpochToLocalTime: function(epoch) {
      const date = new Date(epoch * 1000); // Convert seconds to milliseconds
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return {
        date: `${month}/${day}`,
        hour: `${hours}`,
        time: `${hours}:${minutes}`
      };
    },

    setData: function(data) {
        // convert epoch to local time with extra data
        data.forEach((obj, index) => (
            obj.local_time = this.convertEpochToLocalTime(obj.when)
        ));

        // Group data by date and hour
        this.options.grouped_data = data.reduce((acc, obj) => {
          const date_key = `${obj.local_time.date}`;
          const hour_key = `${obj.local_time.hour}`;
          if (!acc[date_key]) acc[date_key] = {};
          if (!acc[date_key][hour_key]) acc[date_key][hour_key] = [];
          acc[date_key][hour_key].push(obj);
          return acc;
        }, {});

    },

    on_post_render: function() {
         // Get the timeline container
        const timeline = this.el;
        // this.$el.append($("this.options.title"));
        if (!this.options.grouped_data) return this.$el.text("no data");
        this.$el.empty();

        // Generate the timeline visually
        let keys = Object.keys(this.options.grouped_data);
        if (this.options.reversed) {
          keys = keys.reverse();
        }
        keys.forEach(key => {
          const dayColumn = document.createElement('div');
          dayColumn.className = 'day-column';

          const dayLabel = document.createElement('div');
          dayLabel.className = 'day-label';
          dayLabel.textContent = key; // e.g., "01/03 12"
          dayColumn.appendChild(dayLabel);
          const day_data = this.options.grouped_data[key];

          const dayHours = document.createElement('div');
          dayHours.className = 'day-hours';
          dayColumn.appendChild(dayHours);

          Object.keys(day_data).sort().forEach(hkey => {
            // Create a column for each date and hour
            const hourColumn = document.createElement('div');
            hourColumn.className = 'hour-column';
            dayHours.appendChild(hourColumn);

            // Add date and hour label
            const hourLabel = document.createElement('div');
            hourLabel.className = 'hour-label';
            hourLabel.textContent = hkey; // e.g., "01/03 12"
            hourColumn.appendChild(hourLabel);

            // Add each 5-minute segment
            day_data[hkey].forEach(data => {
                const segment = document.createElement('div');
                segment.dataset.action = "item_clicked";
                segment.dataset.label = `Date: ${data.local_time.date}, Time: ${data.local_time.time}, Status: ${data.text}`;
                segment.className = 'time-segment';
                segment.style.backgroundColor = data.status ? 'green' : 'red'; // Green for healthy, red for unhealthy
                segment.textContent = ' ';
                // segment.textContent = data.time.split(':')[1]; // Display only the minutes
                // Add tooltip using the title attribute
                segment.title = `Time: ${data.local_time.time}, Status: ${data.text}`;

                hourColumn.appendChild(segment);
            });
          });

          // Add the hour column to the timeline
          timeline.appendChild(dayColumn);
        });

        this.el.scrollLeft = this.el.scrollWidth;
    },

    on_action_item_clicked: function(evt, id) {
        SWAM.Dialog.show({ title: null, message: $(evt.currentTarget).data("label") });
    },

    refreshHistory: function() {
      SWAM.Rest.GET(this.options.url, null, function(resp, status){
        if (resp.status) {
          const objects = resp.times.map((epoch_time, index) => (
              {
                  when: epoch_time,
                  status: resp.states[index],
                  text: resp.texts[index]
              }
          ));
          this.setData(objects);
          this.render();
        }
      }.bind(this));
    }
});
