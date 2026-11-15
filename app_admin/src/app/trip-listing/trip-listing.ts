import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { trips } from '../data/trips';
import { TripCard } from '../trip-card/trip-card';

import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';

import { Router } from '@angular/router';

import { Authentication } from '../services/authentication';

@Component({
  selector: 'app-trip-listing',
  imports: [CommonModule, TripCard, ReactiveFormsModule],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
  providers: [TripData],
})
export class TripListing implements OnInit {
  // trips: Array<any> = trips;
  trips!: Trip[];
  message: string = '';
  public searchForm!: FormGroup;   // Search boxes above the trip list
  // Clear button
  isSearching = false;             // True after the user searches

    constructor(private tripDataService: TripData,
                private router: Router,
                private authenticationService: Authentication,
                private formBuilder: FormBuilder
              ) {
    console.log('trip-listing constructor');
    }
    
    public addTrip(): void {
    this.router.navigate(['add-trip']);
    }

    // Function to get trips from the API
    // With no search values, it gets every trip
    private getStuff(keyword: string = '', minPrice: string = '', maxPrice: string = ''): void {
    this.tripDataService.getTrips(keyword, minPrice, maxPrice)
      .subscribe({
        next: (value: any) => {
          this.trips = value;

          if (value.length > 0) {
            this.message = 'There are ' + value.length + ' trips available.';
          } else if (this.isSearching) {
            this.message = 'No trips found matching your search.';
          } else {
            this.message = 'There were no trips retrieved from the database';
          }

          console.log(this.message);
        },
        error: (error: any) => {
          this.trips = [];

          // Shows the API's message if there is one
          if (error.error && error.error.message) {
            this.message = error.error.message;
          } else {
            this.message = 'Unable to retrieve trips.';
          }

          console.log('Error: ' + error);
        }
      });
  }

  ngOnInit(): void {
    console.log('ngOnInit');

    // Creates the search form with three empty boxes
    this.searchForm = this.formBuilder.group({
      keyword: [''],
      minPrice: [''],
      maxPrice: ['']
    });

    this.getStuff();
  }

  // Function to search trips using the values in the search form
  public onSearch(): void {
    let keyword = this.searchForm.value.keyword;
    let minPrice = this.searchForm.value.minPrice;
    let maxPrice = this.searchForm.value.maxPrice;

    // Empty number boxes come back as null
    if (keyword === null) { keyword = ''; }
    if (minPrice === null) { minPrice = ''; }
    if (maxPrice === null) { maxPrice = ''; }

    // Number boxes come back as numbers
    keyword = String(keyword);
    minPrice = String(minPrice);
    maxPrice = String(maxPrice);

    // Checks if the user added variables search box
    this.isSearching = keyword.trim() !== '' || minPrice.trim() !== '' || maxPrice.trim() !== '';

    this.getStuff(keyword, minPrice, maxPrice);
  }

  // Function to empty the search boxes and show all trips again
  public clearSearch(): void {
    this.searchForm.reset({ keyword: '', minPrice: '', maxPrice: '' });
    this.isSearching = false;
    this.getStuff();
  }

  public isLoggedIn()
  {
    return this.authenticationService.isLoggedIn();
  }
}
