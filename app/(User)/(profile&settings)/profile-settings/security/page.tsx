"use client";

import React from "react";

export default function Security() {
    const [email2FA, setEmail2FA] = React.useState(false);
    const [authenticator2FA, setAuthenticator2FA] = React.useState(false);

    return (
        <div className="space-y-8 border border-border bg-navbarBg rounded-xl p-4 md:p-6">

            <div className="border border-border rounded-xl p-6">
                <h2 className="text-lg md:text-xl font-bold text-headings mb-2">Two-factor authentication (2FA)</h2>
                <p className="text-sm text-muted mb-6">Keep your account secure by enabling 2FA via SMS or using a temporary one-time passcode (TOTP) from an authenticator app.</p>

                <div className="space-y-6">
                    {/* Via Email */}
                    <div className="flex items-center justify-between pb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Via email</h3>
                            <p className="text-xs text-muted">Receive a one-time passcode via SMS each time you log in.</p>
                        </div>
                        <button
                            onClick={() => setEmail2FA(!email2FA)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${email2FA ? 'bg-bgBlue' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${email2FA ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Authenticator App */}
                    {/* <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Authenticator App (TOTP)</h3>
                            <p className="text-xs text-muted">Use an app to receive a temporary one-time passcode each time you log in.</p>
                        </div>
                        <button
                            onClick={() => setAuthenticator2FA(!authenticator2FA)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${authenticator2FA ? 'bg-bgBlue' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${authenticator2FA ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div> */}
                </div>
            </div>

        </div>
    );
}