import { useSession } from "next-auth/react";
import Button from "./Button";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import type { FormEvent } from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea) {
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }
}


function Form() {
  const session = useSession();
  
  const [inputValue, setInputValue] = useState("");
  const [errorValue, setErrorValue] = useState("");

  const [currentAddress, setCurrentAddress] = useState("");

  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  const fetchUser = api.settings.fetchAddress.useQuery({
    id: session.data!.user.id,
  });

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
    setCurrentAddress(fetchUser.data ? fetchUser.data : "");
  }, [inputValue, fetchUser.data]);

  const updateAddressMutation = api.settings.updateAddress.useMutation({
    onSuccess: (updatedAddress) => {
      if (updatedAddress == null) {
        setInputValue("");
        setErrorValue("Unknown Error. Please try again.");
        return;
      }
      setCurrentAddress(updatedAddress); // Update the displayed address
      setInputValue(""); // Reset input value
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Assuming inputValue contains the updated address
    const updatedAddress = inputValue;
    if (updatedAddress == null || updatedAddress == "") {
      setErrorValue("Address cannot be empty");
      return;
    }

    if (updatedAddress == currentAddress) {
      setErrorValue("Address is the same as previous address");
      return;
    }

    if (
      !(
        updatedAddress.startsWith("ban_1") || updatedAddress.startsWith("ban_3")
      ) ||
      updatedAddress.length != 64
    ) {
      setErrorValue("Address must be valid Banano address");
      return;
    }

    updateAddressMutation.mutate(updatedAddress);
    setErrorValue("");
  };

  if (session.status !== "authenticated") return null;

  return (
    <>
      <div className="h-4"></div>
      <form
        onSubmit={handleSubmit}
        className="mx-5 flex flex-col items-center gap-2 rounded-xl py-2  pt-6"
      >
        <p className="text-lg font-bold">Address</p>
        <p>Current Address:</p>
        <p className="break-all rounded-md bg-gray-300 p-2 font-mono text-lg">
          {" "}
          {currentAddress}
        </p>
        <div className="flex gap-4">
          <textarea
            ref={inputRef}
            style={{ height: 0 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter address"
            className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none sm:w-[400px] md:w-[600px] lg:w-[800px]"
          />
        </div>
        <Button className="">Update</Button>
        {errorValue && <p className="text-red-500">Error: {errorValue}</p>}
      </form>
    </>
  );
}

export function AddressUpdateForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return <Form />;
}
