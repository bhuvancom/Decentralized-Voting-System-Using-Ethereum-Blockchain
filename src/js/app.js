//import "../css/style.css"

const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts)


window.App = {
  eventStart: function () {
    window.ethereum.request({ method: 'eth_requestAccounts' });
    VotingContract.setProvider(window.ethereum)
    VotingContract.defaults({ from: window.ethereum.selectedAddress, gas: 6654755 })

    // Load account data
    App.account = window.ethereum.selectedAddress;
    $("#accountAddress").html("Your Account: " + window.ethereum.selectedAddress);
    VotingContract.deployed().then(function (instance) {
      instance.getCountCandidates().then(function (countCandidates) {
        $(document).ready(function () {
          const votingState = $('#update-voting');
          instance.getVotingState().then((started) => {
            if (started) {
              votingState.html("Stop voting");
              $('#msg').html('Voting started, you can not alter now. Please disable to alter.')
            } else {
              $('#msg').html('Voting not started, Start so people can cast vote.')
              votingState.html("Start voting");
            }
          });
          votingState.click(() => {
            instance.getVotingState().then((isVotingEnabled) => {
              if (isVotingEnabled) {
                instance.disableVoting().then((d) => {
                  window.location.reload(1);
                });
              } else {
                instance.getDates().then(data => {
                  console.log('date data  - ', data);
                  const start = data[0];
                  const end = data[1];
                  if (!start || start < 1) {
                    notifications.show('Define date first', 'error');
                    return;
                  }

                  if (!end || end < 1) {
                    notifications.show('Define date first', 'error');
                    return;
                  }

                  instance.enableVoting().then((d) => {
                    window.location.reload(1);
                  });
                })
              }
            });
          });
          $('#addCandidate').click(function () {
            var nameCandidate = $('#name').val() || "";
            var partyCandidate = $('#party').val() || "";
            if (!nameCandidate || nameCandidate.trim().length == 0) {
              notifications.show('Name is empty', 'error');
              return
            }

            if (!partyCandidate || partyCandidate.trim().length == 0) {
              notifications.show('Party candidate is empty', 'error');
              return
            }

            instance.getVotingState().then((isVotingEnabled) => {
              if (!isVotingEnabled) {
                $("#addCandidate").attr("disabled", false);
                instance.addCandidate(nameCandidate.toUpperCase(), partyCandidate.toUpperCase()).then(function (result) {
                  window.location.reload(1);
                })
                  .catch((error) => {
                    notifications.show('Error while adding, please try to update name and party name.', 'error');
                    $('#msg').html('Error while adding, please try to update name and party name.')
                    console.error(error);
                  });
              } else {
                $("#addCandidate").attr("disabled", true);
                notifications.show("Voting has started, can not modify.", 'error')
              }
            });
          });

          $('#addDate').click(function () {
            var startDate = Date.parse(document.getElementById("startDate").value) / 1000;
            var endDate = Date.parse(document.getElementById("endDate").value) / 1000;
            instance.getVotingState().then((isVotingEnabled) => {
              if (isVotingEnabled) {
                $("#addDate").attr("disabled", true);
                notifications.show("Voting has started, can not modify.", 'error')
              } else {
                $("#addDate").attr("disabled", false);
                instance.setDates(startDate, endDate).then(function (rslt) {
                  console.log("date set");
                  window.location.reload(1);

                });
              }
            });
          });

          instance.getDates().then(function (result) {
            var startDate = new Date(result[0] * 1000);
            var endDate = new Date(result[1] * 1000);
            $("#dates").text(startDate.toDateString(("#DD#/#MM#/#YYYY#")) + " - " + endDate.toDateString("#DD#/#MM#/#YYYY#"));
          }).catch(function (err) {
            console.error("ERROR! " + err.message)
            notifications.show('error while getting dates ' + err, 'error')
          });
        });

        for (var i = 0; i < countCandidates; i++) {
          instance.getCandidate(i + 1).then(function (data) {
            var id = data[0];
            var name = data[1];
            var party = data[2];
            var voteCount = data[3];
            var viewCandidates = `<tr><td> <input class="form-check-input" type="radio" name="candidate" value="${id}" id=${id}>` + `<span style='padding: 10px'>` + name + "</span></td><td>" + party + "</td><td>" + voteCount + "</td></tr>"
            $("#boxCandidate").append(viewCandidates)
          })
        }

        window.countCandidates = countCandidates
      });

      instance.checkVote().then(function (voted) {
        console.log(voted);
        instance.getVotingState().then((isVotingEnabled) => {
          if (!isVotingEnabled) {
            $('#voteButton').hide();
            $('#msg1').show();
            $("#msg1").html("<p>Voting not enabled yet.</p>");
          } else {
            $('#msg1').hide();
          }

          if (voted) {
            $("#voteButton").html("You already voted!!");
          } else {
            $("#voteButton").attr("disabled", false);
          }
        });
      });

    }).catch(function (err) {
      notifications.show('error ' + err, 'error');
      console.error("ERROR! " + err.message)
    })
  },

  vote: function () {
    var candidateID = $("input[name='candidate']:checked").val();
    if (!candidateID) {
      $('#msg1').show();
      $("#msg1").html("<p>Please vote for a candidate.</p>")
      return
    }
    VotingContract.deployed().then(function (instance) {
      instance.vote(parseInt(candidateID)).then(function (result) {
        $("#voteButton").attr("disabled", true);
        $('#msg1').show();
        $("#msg1").html("<p>Voted</p>");
        window.location.reload(1);
      })
    }).catch(function (err) {
      $('#msg1').show();
      $("#msg1").html(`<p>${err.message}</p>`)
      console.error("ERROR! " + err.message)
    })
  }
}

// sets up eth server connection
window.addEventListener("load", function () {
  $('.loading').show();
  console.log('showing loader');

  if (typeof web3 !== "undefined") {
    console.warn("Using web3 detected from external source like Metamask")
    window.eth = new Web3(window.ethereum)
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for deployment. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    window.eth = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"))
  }
  $('.loading').hide();
  console.log('hiding loader');
  window.App.eventStart()
})