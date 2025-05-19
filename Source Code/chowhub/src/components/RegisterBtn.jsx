import React from "react";
import Link from "next/link";

export default function RegisterBtn() {
  return (
    <Link href="/create-restaurant">
      <button
        type="button"
        className="btn btn-success btn-lg rounded-0 text-capitalize mx-2 mb-3 mb-sm-0"
      >
        Start Your Restaurant
      </button>
    </Link>
  );
}
