let selectedSeats = [];
let currentShow = "";


// Book Now button
function bookTicket(movieName, showTime) {

    currentShow = movieName + "-" + showTime;

    selectedSeats = [];

    document.getElementById("booking").style.display = "block";

    document.getElementById("selectedMovie").innerText =
        movieName;

    document.getElementById("selectedTime").innerText =
        "Show Time: " + showTime;

    document.getElementById("seatInfo").innerText =
        "Selected Seats: None";

    let seatContainer =
        document.getElementById("seatContainer");

    seatContainer.innerHTML = "";

    // Show loading message
    seatContainer.innerHTML =
        "<p>Loading seats...</p>";


    // Get bookings directly from MySQL
    fetch("http://localhost:8080/api/booking")

        .then(response => response.json())

        .then(bookings => {

            // Clear loading message
            seatContainer.innerHTML = "";

            // Find booked seats for current movie/show
            let bookedSeats = [];

            bookings.forEach(booking => {

                if (
                    booking.movieName === movieName &&
                    booking.showTime === showTime
                ) {

                    let seats = booking.seats
                        .split(",")
                        .map(Number);

                    bookedSeats.push(...seats);
                }
            });


            // Create 100 seats
            for (let i = 1; i <= 100; i++) {

                let seat = document.createElement("button");

                seat.innerText = i;
                seat.classList.add("seat");


                // Check if seat is booked in MySQL
                if (bookedSeats.includes(i)) {

                    seat.classList.add("booked");
                    seat.disabled = true;

                } else {

                    seat.onclick = function () {

                        if (seat.classList.contains("selected")) {

                            seat.classList.remove("selected");

                            selectedSeats =
                                selectedSeats.filter(
                                    number => number !== i
                                );

                        } else {

                            seat.classList.add("selected");

                            selectedSeats.push(i);
                        }


                        document.getElementById("seatInfo").innerText =
                            "Selected Seats: " +
                            (
                                selectedSeats.length > 0
                                    ? selectedSeats.join(", ")
                                    : "None"
                            );
                    };
                }


                seatContainer.appendChild(seat);
            }

        })

        .catch(error => {

            console.error("Error:", error);

            seatContainer.innerHTML =
                "<p>Unable to load seats. Please start the backend.</p>";
        });


    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}



// Confirm Booking
function confirmBooking() {

    if (selectedSeats.length === 0) {

        alert("Please select at least one seat!");

        return;
    }


    const movieName =
        document.getElementById("selectedMovie").innerText;


    const showTime =
        document.getElementById("selectedTime").innerText
            .replace("Show Time: ", "");


    const bookingData = {

        movieName: movieName,

        showTime: showTime,

        seats: selectedSeats.join(",")
    };


    // Save booking directly to MySQL
    fetch("http://localhost:8080/api/booking", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(bookingData)

    })

    .then(response => response.json())

    .then(data => {

        alert(
            "Booking Successful!\n\n" +
            "Movie: " + data.movieName +
            "\nShow: " + data.showTime +
            "\nSeats: " + data.seats
        );


        // Clear selected seats
        selectedSeats = [];


        // Reload seats from MySQL
        bookTicket(movieName, showTime);
    })

    .catch(error => {

        console.error("Error:", error);

        alert(
            "Booking failed.\n\n" +
            "Please make sure the Spring Boot backend is running."
        );
    });
}