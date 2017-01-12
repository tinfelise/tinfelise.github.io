// This is the code to change the size of the html table to match
// the number of versions that have been selected.
var table_size = 0;
var version_names = "XABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var versions = 2;
function addVariation () {
  document.forms[0]["version-count"].value ++;
  adjust_table_size ();
};
function removeVariation () {
  document.forms[0]["version-count"].value --;
  adjust_table_size ();
};
function adjust_table_size () {
  var versions = document.forms[0]["version-count"].value - 0;
  if (versions < 2) {
    alert("Must have at least 2 versions!");
    document.forms[0]["version-count"].value = table_size;
    return;
  }
  else if (versions > 1) {
  }
  else {
    alert("I don't understand that number of versions");
    document.forms[0]["version-count"].value = table_size;
    return;
  }
  // for (var i = table_size + 1; i <= versions; i++) {
  //   var new_row = document.getElementById("data").insertRow(-1);

  //   new_row.insertCell(0).innerHTML =
  //     "<input id=\"name_" + i +
  //     "\" value=\"" + version_names[i] + "\"></input>";

  //   new_row.insertCell(1).innerHTML =
  //     "<input id=\"trials_" + i + "\"></input>";

  //   new_row.insertCell(2).innerHTML =
  //     "<input id=\"success_" + i + "\"></input>";
  // }
  for (var i = table_size + 1; i <= versions; i++) {
    var new_row = document.getElementById("data").innerHTML += //why do i need var new_row? where is that called?
      "<div class='test clearfix' id='variation" + version_names[i] +"'>" + 
        "<input class='variationInput'id='name_" + i + "' value='" + version_names[i] + "'></input>" +
        "<div class='variation'><span>" + version_names[i] +
        ((i > 2) ?  "<a class='removeVariation' onclick='removeVariation()'>x</a>" : "") + //Turnary evaluator
        "</span></div>" +
        "<div class='trial input'>" +
          "<input type='number' id='trials_" + i + "' tabindex='" + i + "'></input>" +
          "<label for='trials_" + i + "'>Trials</label>" +
          "<span></span>" +
        "</div>" +
        "<div class='success input'>" +
          "<input type='number' id='success_" + i + "' tabindex='" + i + "'></input>" + 
          "<label for='success_" + i + "'>Successes</label>" +
          "<span></span>" +
      "</div>";
  }

  // for (var i = table_size; i > versions; i--) {
  //   document.getElementById("data").deleteRow(i);
  // }
  for (var i = table_size; i > versions; i--) {
    var remove = document.getElementById("variation"+version_names[i]);
    remove.parentNode.removeChild(remove);
  }

  table_size = versions;
}

// We need to start with a table.
adjust_table_size();

// This extracts the information from the table, calculates the answer
// and displays it.
function calculate_and_display_answer () {
  var version_information;
  try {
    // This is an array of arrays.  They take the form:
    // [ version_name, success, fail, success_ratio ];
    version_information = extract_version_information();
  }
  catch (err) {
    alert(err);
    return false;
  }

  // Let's scan once to get max, min, and data_all.
  var min = version_information[0];
  var max = version_information[0];
  var data_all = [];
  var versions = version_information.length;
  var min_value = max[1];
  for (var i = 0; i < versions; i++) {
    var this_version = version_information[i];
    data_all.push( [this_version[1], this_version[2]] );

    if (this_version[3] > max[3]) {
      max = this_version;
    }
    else if (this_version[3] < min[3]) {
      min = this_version;
    }

    if (this_version[1] < min_value)
      min_value = this_version[1];

    if (this_version[2] < min_value)
      min_value = this_version[2];
  }

  var g_test_all = calculate_g_test(data_all);
  if (document.getElementById("is-yates").checked) {
    g_test_all = calculate_g_test_with_yates(data_all);
  }

  var p_all = chisqrprob(versions - 1, g_test_all);
  var certainty_all = round_to_precision( 100 * (1-p_all), 2);

  // if (min_value < 10) {
  //   document.getElementById("answer").innerHTML =
  //     ("<div class='disclaimer'><b>Note:</b> Some measurements were below 10, so confidence values may be inaccurate.</div>");
  // }
  // else {
  //   document.getElementById("answer").innerHTML = "";
  // }
  var disclaimer = '';
  if (min_value < 10) {
    disclaimer = "<div class='disclaimer'><b>Note:</b> Some measurements were below 10, so confidence values may be inaccurate.</div>";
  }
  else {
    disclaimer = '';
  }

  if (versions == 2) {

    document.getElementById("answer").innerHTML =
      "<h2>Gabri says...</h2>" +
      // "<h2>And the winner is...</h2>" +
      "<div class='clearfix'><div class='gStat'><strong>" + round_to_precision(g_test_all, 4) + "</strong> <span>G Stat</span></div>" + 
      "<div class='winner'><div class='circle'>" + max[0] + "<span>wins</span></div></div>" + 
      "<div class='confidence'>" +certainty_all + "%<span>confidence</span></div></div>" + disclaimer + 
      "<a class='shareResults'>Share</a>";
    document.getElementById("answer").className = "display";
    document.getElementById("container").className = "makeRoom";
  }
  else {
    var data = [[min[1], min[2]], [max[1], max[2]]];
    var g_test;
    if (document.getElementById("is-yates").checked)
      g_test = calculate_g_test_with_yates(data);
    else 
      g_test = calculate_g_test(data);

    var p = chisqrprob(1, g_test);
    
    // Fudge factor time
    p *= versions * (versions - 1) / 2;

    if (p >= 1) {
      document.getElementById("answer").innerHTML =
        "No version is currently cleary winning.";
    }
    else {
      var certainty = round_to_precision( 100 * (1-p), 2);
      document.getElementById("answer").innerHTML =
        "Comparing versions '" + min[0] + "' and '" + max[0] +
        "' gives a G-test statistic of " +
        round_to_precision(g_test, 4) + " so version '" +
        min[0] + "' can be dropped with at least " +
        certainty + "% confidence."
    }
    document.getElementById("answer").innerHTML +=
      "<br><br>The G-test statistic across all versions is " +
      round_to_precision(g_test_all, 4) +
      " so we conclude there is some difference with " +
      certainty_all + "% confidence.";
  }
}

function extract_version_information () {
  var get_counts_from_values;
  if (document.getElementById("success-count").checked) {
    get_counts_from_values = function (name, trials, success) {
      if (trials < success) {
        throw(
          "Version '" + name + "' cannot have more successes than trials"
        );
      }

      return [success, trials - success];
    };
  }
  else if (document.getElementById("success-percentage").checked) {
    get_counts_from_values = function (name, trials, success) {
      if (100 < success) {
        throw(
          "Version '" + name + "' cannot succeed with probability > 100%"
        );
      }

      return [trials*success/100, trials*(1 - success/100)];
    };
  }
  else {
    throw("Unknown success type");
  }

  var saw_name = {};
  var to_return = [];
  for (var i = 1; i <= table_size; i++) {
    var name = document.getElementById("name_" + i).value;
    if ("" == name) {
      throw("Version " + i + " has no name?");
    }
    else if (saw_name[name] > 0) {
      throw(
        "Versions " + i + " and " + saw_name[name] + " are named " + name
      );
    }
    else {
      saw_name[name] = i;
    }

    var trials = document.getElementById("trials_" + i).value;
    if (! (0 < trials)) {
      throw("Version '" + name + "' needs trials!");
    }

    var success = document.getElementById("success_" + i).value;
    if (! (0 < success)) {
      throw("Version '" + name + "' needs successes!");
    }

    var counts = get_counts_from_values(name, trials - 0, success - 0);
    to_return.push(
      [name, counts[0], counts[1], counts[0]/(counts[0] + counts[1])]
    );
  }

  return to_return;
}

// This takes an array of arrays of any size, and calculates
// the raw g-test value.  It assumes a square matrix of arguments.
function calculate_g_test (data) {
  var rows = data.length;
  var columns = data[0].length;

  // Initialize our subtotals
  var row_totals = [];
  for (var i = 0; i < rows; i++) {
    row_totals[i] = 0;
  }

  var column_totals = [];
  for (var j = 0; j < columns; j++) {
    column_totals[j] = 0;
  }

  var total = 0;

  // First we calculate the totals for the row and the column
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      var entry = data[i][j] - 0;  // - 0 ensures numeric
      row_totals[i]    += entry;
      column_totals[j] += entry;
      total            += entry;
    }
  }

  // Now we calculate the g-test contribution from each entry.
  var g_test = 0;;
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      var expected = row_totals[i] * column_totals[j] / total;
      var seen     = data[i][j];

      g_test      += 2 * seen * Math.log( seen / expected );
    }
  }

  return g_test;
}

// This takes an array of arrays of any size, and calculates
// the raw g-test value with the Yates continuity correction.
// It assumes a square matrix of arguments.
function calculate_g_test_with_yates (data) {
  var rows = data.length;
  var columns = data[0].length;

  // Initialize our subtotals
  var row_totals = [];
  for (var i = 0; i < rows; i++) {
    row_totals[i] = 0;
  }

  var column_totals = [];
  for (var j = 0; j < columns; j++) {
    column_totals[j] = 0;
  }

  var total = 0;

  // First we calculate the totals for the row and the column
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      var entry = data[i][j] - 0;  // - 0 ensures numeric
      row_totals[i]    += entry;
      column_totals[j] += entry;
      total            += entry;
    }
  }

  // Now we calculate the g-test contribution from each entry.
  var g_test = 0;;
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      var expected = row_totals[i] * column_totals[j] / total;
      var seen     = data[i][j];

      // The Yates continuity correction, adjust the seen value 0.5
      // towards the expected value.
      if (expected + 0.5 < seen)
        seen -= 0.5;
      else if (expected - 0.5 > seen)
        seen += 0.5;
      else
        seen = expected;

      g_test      += 2 * seen * Math.log( seen / expected );
    }
  }

  return g_test;
}