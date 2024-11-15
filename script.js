document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-level");
    const mediumLabel = document.getElementById("medium-level");
    const hardLabel = document.getElementById("hard-level");
    const cardStatesContainer = document.querySelector(".states-cards");

    // Validate username
    function validateUsername(username) {
        const usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;
        return usernamePattern.test(username);
    }

    // Fetch user details
    async function fetchUserDetails(username) {
        if (!validateUsername(username)) {
            console.error("Invalid username format.");
            statsContainer.innerHTML = '<p>Invalid username format.</p>';
            return;
        }

        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://leetcode.com/graphql/';
        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");

        const graphql = JSON.stringify({
            query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                }
            `,
            variables: { "username": username }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
            redirect: "follow"
        };

        try {
            searchButton.textContent = "Loading...";
            searchButton.disabled = true;
            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the user details");
            }
            const data = await response.json();
            console.log("Logging data: ", data);

            // Handle the data
            if (data.data.matchedUser) {
                const userStats = data.data.matchedUser.submitStats;

                // Get solved and total problems for each difficulty level
                const easySolved = userStats.acSubmissionNum.find(d => d.difficulty === "Easy")?.count || 0;
                const mediumSolved = userStats.acSubmissionNum.find(d => d.difficulty === "Medium")?.count || 0;
                const hardSolved = userStats.acSubmissionNum.find(d => d.difficulty === "Hard")?.count || 0;

                const easyTotal = userStats.totalSubmissionNum.find(d => d.difficulty === "Easy")?.count || 0;
                const mediumTotal = userStats.totalSubmissionNum.find(d => d.difficulty === "Medium")?.count || 0;
                const hardTotal = userStats.totalSubmissionNum.find(d => d.difficulty === "Hard")?.count || 0;

                // Update the level text content to show solved/total format
                easyLabel.textContent = `${easySolved}/${easyTotal}`;
                mediumLabel.textContent = `${mediumSolved}/${mediumTotal}`;
                hardLabel.textContent = `${hardSolved}/${hardTotal}`;

                // Update progress circles (scaled by the total number of problems)
                easyProgressCircle.style.width = `${(easySolved / easyTotal) * 100}%`;
                mediumProgressCircle.style.width = `${(mediumSolved / mediumTotal) * 100}%`;
                hardProgressCircle.style.width = `${(hardSolved / hardTotal) * 100}%`;

            } else {
                statsContainer.innerHTML = '<p>No user found.</p>';
            }

        } catch (error) {
            console.error("Error fetching user details:", error);
            statsContainer.innerHTML = '<p>No data found.</p>';
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    // Handle the search button click
    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("Logging username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        } else {
            statsContainer.innerHTML = '<p>Invalid username format.</p>';
        }
    });
});
