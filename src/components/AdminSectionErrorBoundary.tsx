"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  resetKey: string;
}

interface State {
  hasError: boolean;
}

export default class AdminSectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Admin section failed to render:", error, info.componentStack);
  }

  componentDidUpdate(previousProps: Props) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <h2 className="text-base font-bold text-red-900">This admin section could not load.</h2>
          <p className="mt-2 text-sm text-red-800">
            Other dashboard sections remain available. Retry this section or switch tabs.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded-lg bg-red-900 px-4 py-2 text-xs font-bold text-white"
          >
            Retry section
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
